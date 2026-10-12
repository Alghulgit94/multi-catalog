"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Product, Category, Subcategory } from "@/lib/types-catalog"
import { toAssetVersion, MAX_GALLERY_IMAGES as MAX_GALLERY } from "@/lib/types-catalog"
import { buildImageUrl } from "@/lib/media-urls"
import { createProduct, updateProduct, updateProductImages, uploadProductImage } from "./actions"
import { slugify, sanitizeSlugInput } from "@/lib/slug"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useSidebar } from "@/contexts/sidebar-context"

interface Props {
  product?: Product
  categories: Category[]
  subcategories: Subcategory[]
}

type CoverState =
  | { status: "empty" }
  | { status: "uploaded"; publicId: string; preview: string }
  | { status: "pending";  file: File;       preview: string }

type GalleryItem =
  | { status: "uploaded"; publicId: string; preview: string }
  | { status: "pending";  file: File;       preview: string }

export function ProductoForm({ product, categories, subcategories }: Props) {
  const router = useRouter()
  const { isCollapsed } = useSidebar()
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState(product?.slug || "")
  const [slugEdited, setSlugEdited] = useState(!!product?.slug)
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    product?.category_id || categories[0]?.id || ""
  )
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(
    product?.subcategory_id || ""
  )

  // Cover image state
  const [cover, setCover] = useState<CoverState>(
    product?.cover_image
      ? {
          status: "uploaded",
          publicId: product.cover_image,
          preview: buildImageUrl(product.cover_image, 400, toAssetVersion(product.updated_at)),
        }
      : { status: "empty" }
  )
  const coverFileRef = useRef<HTMLInputElement>(null)

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(
    (product?.gallery_images || []).map((pid) => ({
      status: "uploaded",
      publicId: pid,
      preview: buildImageUrl(pid, 200, toAssetVersion(product?.updated_at)),
    }))
  )
  const galleryFileRef = useRef<HTMLInputElement>(null)

  // Track object URLs for cleanup
  const objectUrlsRef = useRef<string[]>([])

  useEffect(() => {
    return () => { objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)) }
  }, [])

  function getSelectedCategorySlug() {
    return categories.find((c) => c.id === selectedCategoryId)?.slug || "general"
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) {
      setSlug(slugify(e.target.value))
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(sanitizeSlugInput(e.target.value))
    setSlugEdited(true)
  }

  // ─── Cover image ─────────────────────────────────────────────────────────

  function onCoverSelected(file: File) {
    const preview = URL.createObjectURL(file)
    objectUrlsRef.current.push(preview)
    setCover({ status: "pending", file, preview })
  }

  function onCoverDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onCoverSelected(file)
  }

  function onCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onCoverSelected(file)
  }

  // ─── Gallery ─────────────────────────────────────────────────────────────

  function onGalleryFileSelected(file: File) {
    if (galleryItems.length >= MAX_GALLERY) return
    const preview = URL.createObjectURL(file)
    objectUrlsRef.current.push(preview)
    setGalleryItems((prev) => [...prev, { status: "pending", file, preview }])
  }

  function onGalleryFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = "" // Reset so the same files can be re-selected
    if (files.length === 0) return

    const availableSlots = MAX_GALLERY - galleryItems.length
    const toAdd = files.slice(0, availableSlots)
    if (files.length > toAdd.length) {
      toast.error(`Solo se agregaron ${toAdd.length} imágenes (máximo ${MAX_GALLERY} en total)`)
    }
    toAdd.forEach(onGalleryFileSelected)
  }

  function removeGalleryItem(index: number) {
    setGalleryItems((prev) => {
      const item = prev[index]
      if (item.status === "pending") URL.revokeObjectURL(item.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget   // capturar ANTES de cualquier await
    setLoading(true)

    if (galleryItems.length > MAX_GALLERY) {
      toast.error(`Máximo ${MAX_GALLERY} imágenes en la galería`)
      setLoading(false)
      return
    }

    // ── 1. Guardar en la BD PRIMERO ──────────────────────────────────────────
    // Las imágenes se suben recién después, con el slug ya confirmado por el
    // servidor. Al revés (como estaba antes) un slug duplicado sobrescribía en
    // R2 las fotos del producto existente aunque el insert fallara.
    const hasPendingUploads =
      cover.status === "pending" || galleryItems.some((i) => i.status === "pending")

    const uploadedCoverId = cover.status === "uploaded" ? cover.publicId : ""
    const uploadedGalleryIds = galleryItems
      .filter((i): i is Extract<GalleryItem, { status: "uploaded" }> => i.status === "uploaded")
      .map((i) => i.publicId)

    // Si hay algo por subir, este primer guardado NO toca las imágenes que el
    // producto ya tiene: si la subida falla o se cierra la pestaña, no se pierden.
    // El paso 3 escribe después la lista definitiva, con las altas y las bajas.
    const initialCoverId = hasPendingUploads ? product?.cover_image ?? "" : uploadedCoverId
    const initialGalleryIds = hasPendingUploads
      ? product?.gallery_images ?? []
      : uploadedGalleryIds

    const fd = new FormData(form)
    fd.set("slug", slug)
    fd.set("cover_image", initialCoverId)
    fd.set("gallery_images", JSON.stringify(initialGalleryIds))
    fd.set("subcategory_id", selectedSubcategoryId)

    // Fix checkboxes (unchecked = not present in FormData)
    if (!fd.has("show_price")) fd.set("show_price", "false")
    if (!fd.has("featured")) fd.set("featured", "false")
    if (!fd.has("is_active")) fd.set("is_active", "false")
    if (!fd.has("is_visible")) fd.set("is_visible", "false")
    // Override with true if checkbox was checked
    if (form.querySelector<HTMLInputElement>('[name="show_price"]')?.checked) fd.set("show_price", "true")
    if (form.querySelector<HTMLInputElement>('[name="featured"]')?.checked) fd.set("featured", "true")
    if (form.querySelector<HTMLInputElement>('[name="is_active"]')?.checked) fd.set("is_active", "true")
    if (form.querySelector<HTMLInputElement>('[name="is_visible"]')?.checked) fd.set("is_visible", "true")

    const saved = product
      ? await updateProduct(product.id, fd)
      : await createProduct(fd)

    if (saved.error || !saved.id) {
      setLoading(false)
      toast.error(saved.error || "Error al guardar el producto")
      return
    }

    const productId = saved.id
    // El servidor puede haber desambiguado el slug (alfombra-yute → alfombra-yute-2).
    const finalSlug = saved.slug || slug
    if (finalSlug !== slug) setSlug(finalSlug)

    // ── 2. Subir las imágenes pendientes con el slug definitivo ──────────────
    const finalCategorySlug = getSelectedCategorySlug()
    const failures: string[] = []

    let finalCoverPublicId = uploadedCoverId

    if (cover.status === "pending") {
      const result = await uploadProductImage(cover.file, finalSlug, "cover")
      if (result.error) {
        failures.push(`portada (${result.error})`)
      } else {
        URL.revokeObjectURL(cover.preview)
        finalCoverPublicId = result.public_id!
        setCover({ status: "uploaded", publicId: result.public_id!, preview: result.secure_url! })
      }
    }

    type GalleryUploadResult =
      | { ok: true; index: number; item: GalleryItem; publicId: string; url: string }
      | { ok: false; index: number; error: string }

    const galleryResults: GalleryUploadResult[] = await Promise.all(
      galleryItems.map((item, i): Promise<GalleryUploadResult> =>
        item.status === "uploaded"
          ? Promise.resolve({ ok: true, index: i, item, publicId: item.publicId, url: item.preview })
          : uploadProductImage(item.file, finalSlug, "gallery", i).then((result) =>
              result.error
                ? { ok: false, index: i, error: result.error }
                : { ok: true, index: i, item, publicId: result.public_id!, url: result.secure_url! }
            )
      )
    )

    galleryResults.forEach((r) => {
      if (!r.ok) failures.push(`imagen ${r.index + 1} (${r.error})`)
    })

    // Se persiste lo que sí subió, para no dejar assets huérfanos en R2.
    const ok = galleryResults
      .filter((r): r is Extract<GalleryUploadResult, { ok: true }> => r.ok)
      .sort((a, b) => a.index - b.index)

    ok.filter((r) => r.item.status === "pending").forEach((r) => URL.revokeObjectURL(r.item.preview))

    const finalGalleryIds = ok.map((r) => r.publicId)
    setGalleryItems(
      ok.map((r): GalleryItem => ({ status: "uploaded", publicId: r.publicId, preview: r.url }))
    )

    // ── 3. Persistir los public_id definitivos ───────────────────────────────
    if (hasPendingUploads) {
      const imgResult = await updateProductImages(productId, {
        cover_image: finalCoverPublicId || null,
        gallery_images: finalGalleryIds,
      })
      if (imgResult.error) failures.push(imgResult.error)
    }

    setLoading(false)

    const savedLabel = product ? "Producto actualizado" : "Producto creado"
    if (failures.length > 0) {
      // El producto ya está guardado: avisar sin bloquear, se reintenta editando.
      toast.error(`${savedLabel}, pero fallaron imágenes: ${failures.join(", ")}. Editá el producto para reintentar.`)
    } else if (finalSlug !== slug) {
      toast.success(`${savedLabel} con el slug «${finalSlug}»`)
    } else {
      toast.success(savedLabel)
    }
    router.push("/panel/productos")
  }

  const slots = Array.from({ length: MAX_GALLERY })

  return (
    <form onSubmit={handleSubmit} className="pb-28">
      <div className="px-8 grid grid-cols-12 gap-8 mt-2">

        {/* ── Columna izquierda 8/12 ── */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* Card: Información Principal */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="px-6 pt-6 pb-4 border-b flex items-center gap-2">
              <span className="material-symbols-outlined text-muted-foreground text-[20px]">info</span>
              <h2 className="font-semibold text-base">Información Principal</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Nombre + Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={product?.name}
                    onChange={handleNameChange}
                    placeholder="Sofá Minimalista Velvet"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">Slug</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground text-[16px]">link</span>
                    <Input
                      id="slug"
                      name="slug"
                      required
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="sofa-minimalista-velvet"
                      className="pl-9 font-mono text-sm italic text-muted-foreground"
                      readOnly={!!product?.slug && !slugEdited}
                    />
                  </div>
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-1.5">
                <Label htmlFor="category_id">Categoría *</Label>
                <select
                  id="category_id"
                  name="category_id"
                  required
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value)
                    setSelectedSubcategoryId("")
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategoría */}
              <div className="space-y-1.5">
                <Label htmlFor="subcategory_id">Subcategoría <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <select
                  id="subcategory_id"
                  name="subcategory_id"
                  value={selectedSubcategoryId}
                  onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Sin subcategoría</option>
                  {subcategories
                    .filter((s) => s.category_id === selectedCategoryId && s.is_active)
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Descripción corta */}
              <div className="space-y-1.5">
                <Label htmlFor="short_description">Descripción Corta *</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  required
                  defaultValue={product?.short_description || ""}
                  rows={2}
                  placeholder="Texto breve para las tarjetas del catálogo"
                />
              </div>

              {/* Descripción completa */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción Completa *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  defaultValue={product?.description || ""}
                  rows={6}
                  placeholder="Descripción detallada para la página del producto"
                />
              </div>
            </div>
          </div>

          {/* Card: Media & Galería */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="px-6 pt-6 pb-4 border-b flex items-center gap-2">
              <span className="material-symbols-outlined text-muted-foreground text-[20px]">image</span>
              <h2 className="font-semibold text-base">Media &amp; Galería</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-12 gap-4">
                {/* Imagen de portada — col 4 */}
                <div className="col-span-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Imagen de portada</p>
                  {cover.status !== "empty" ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden border shadow-sm group">
                      <img
                        src={cover.preview}
                        alt="Portada"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (cover.status === "pending") URL.revokeObjectURL(cover.preview)
                            setCover({ status: "empty" })
                          }}
                          className="rounded-full bg-destructive text-white p-2 shadow"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDrop={onCoverDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => coverFileRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      <>
                        <span className="material-symbols-outlined text-muted-foreground text-[32px]">add_photo_alternate</span>
                        <p className="text-xs text-muted-foreground text-center px-3">Arrastra o haz clic</p>
                      </>
                    </div>
                  )}
                  <input
                    ref={coverFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onCoverFileChange}
                  />
                </div>

                {/* Galería — col 8 */}
                <div className="col-span-8 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Galería de imágenes (Máx {MAX_GALLERY})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((_, i) => {
                      const item = galleryItems[i]
                      return (
                        <div key={i} className="relative aspect-square">
                          {item ? (
                            <div className="relative h-full w-full group">
                              <img
                                src={item.preview}
                                alt={`Galería ${i + 1}`}
                                className="h-full w-full object-cover rounded-lg border shadow-sm"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeGalleryItem(i)}
                                  className="rounded-full bg-destructive text-white p-1 shadow"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={galleryItems.length >= MAX_GALLERY || loading}
                              onClick={() => galleryFileRef.current?.click()}
                              className="h-full w-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground"
                            >
                              <span className="material-symbols-outlined text-[20px]">add</span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <input
                    ref={galleryFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onGalleryFileChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna derecha 4/12 ── */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* Card: Precio y Visibilidad */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="px-6 pt-6 pb-4 border-b flex items-center gap-2">
              <span className="material-symbols-outlined text-muted-foreground text-[20px]">payments</span>
              <h2 className="font-semibold text-base">Precio y Visibilidad</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Precio */}
              <div className="space-y-1.5">
                <Label htmlFor="price">Precio (Gs.)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₲</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1000"
                    defaultValue={product?.price ?? ""}
                    placeholder="0"
                    className="pl-7"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags / Etiquetas</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={(product?.tags || []).join(", ")}
                  placeholder="sofa, nordico, tela"
                />
                <p className="text-xs text-muted-foreground">Separados por coma</p>
              </div>

              <hr className="border-border" />

              {/* Checkboxes */}
              <div className="space-y-3">
                {[
                  { name: "show_price", label: "Mostrar precio", default: product?.show_price ?? false },
                  { name: "featured", label: "Destacado", default: product?.featured ?? false },
                  { name: "is_active", label: "Activo", default: product?.is_active ?? true },
                  { name: "is_visible", label: "Visible", default: product?.is_visible ?? true },
                ].map((field) => (
                  <label key={field.name} className="flex items-center gap-3 cursor-pointer select-none group">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        name={field.name}
                        value="true"
                        defaultChecked={field.default}
                        className="peer h-5 w-5 appearance-none rounded border border-input bg-white checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                      />
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 text-white">
                        <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                      </span>
                    </div>
                    <span className="text-sm font-medium group-hover:text-foreground/80 transition-colors">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Box: Consejo Pro */}
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">lightbulb</span>
              <span className="text-sm font-semibold">Consejo Pro</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Usa un slug descriptivo y único para mejorar el SEO. Agrega imágenes de alta calidad y una descripción completa para aumentar las conversiones.
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer fijo ── */}
      <footer
        className="fixed bottom-0 right-0 h-20 bg-white border-t flex items-center justify-end px-8 gap-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-[left]"
        style={{ left: isCollapsed ? "4rem" : "16rem" }}
      >
        <Button type="button" variant="ghost" onClick={() => router.push("/panel/productos")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <span className="material-symbols-outlined text-sm mr-2">save</span>
          {loading ? "Guardando..." : product ? "Actualizar Producto" : "Crear Producto"}
        </Button>
      </footer>
    </form>
  )
}
