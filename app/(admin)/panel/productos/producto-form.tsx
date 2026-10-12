"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Product, Category, Subcategory } from "@/lib/types-catalog"
import { toAssetVersion, MAX_GALLERY_IMAGES as MAX_GALLERY } from "@/lib/types-catalog"
import { buildImageUrl } from "@/lib/media-urls"
import { prepararImagen } from "@/lib/image-prep"
import type { UploadOutcome } from "@/lib/media"
import { createProduct, updateProduct, updateProductImages, uploadProductImage } from "./actions"
import { slugify, sanitizeSlugInput } from "@/lib/slug"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Dropzone } from "@/components/panel/dropzone"
import { CheckField, Field, FormSection } from "@/components/panel/form-section"
import { UnsavedChangesBar, useDirtyForm } from "@/components/panel/unsaved-changes-bar"

const SIN_SUBCATEGORIA = "__ninguna__"

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

/** "Descartar" remonta el formulario con los valores originales. */
export function ProductoForm(props: Props) {
  const [resetKey, setResetKey] = useState(0)
  return <ProductoFormInner key={resetKey} {...props} onDiscard={() => setResetKey((k) => k + 1)} />
}

function ProductoFormInner({ product, categories, subcategories, onDiscard }: Props & { onDiscard: () => void }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
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

  const { dirty, check, markClean } = useDirtyForm(formRef, {
    slug,
    selectedCategoryId,
    selectedSubcategoryId,
    cover: cover.status === "empty" ? null : cover.preview,
    gallery: galleryItems.map((i) => i.preview),
  })

  // Track object URLs for cleanup
  const objectUrlsRef = useRef<string[]>([])

  useEffect(() => {
    return () => { objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)) }
  }, [])

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

  function removeCover() {
    if (cover.status === "pending") URL.revokeObjectURL(cover.preview)
    setCover({ status: "empty" })
  }

  // ─── Gallery ─────────────────────────────────────────────────────────────

  function onGalleryFileSelected(file: File) {
    if (galleryItems.length >= MAX_GALLERY) return
    const preview = URL.createObjectURL(file)
    objectUrlsRef.current.push(preview)
    setGalleryItems((prev) => [...prev, { status: "pending", file, preview }])
  }

  function onGalleryFiles(files: File[]) {
    if (files.length === 0) return

    const availableSlots = MAX_GALLERY - galleryItems.length
    const toAdd = files.slice(0, availableSlots)
    if (files.length > toAdd.length) {
      toast.error(`Se agregaron ${toAdd.length} fotos: la galería admite hasta ${MAX_GALLERY}.`)
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

  /**
   * Achica la foto y la sube. Nunca lanza: si se corta la conexión devuelve
   * { error }, para que el producto (ya guardado) no quede a medias sin aviso.
   */
  async function subirFoto(file: File, productSlug: string, tipo: "cover" | "gallery", index?: number): Promise<UploadOutcome> {
    try {
      const liviana = await prepararImagen(file)
      return await uploadProductImage(liviana, productSlug, tipo, index)
    } catch {
      return { error: "se cortó la conexión" }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget   // capturar ANTES de cualquier await
    setLoading(true)

    if (galleryItems.length > MAX_GALLERY) {
      toast.error(`La galería admite hasta ${MAX_GALLERY} fotos`)
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

    const pendientes = (cover.status === "pending" ? 1 : 0) + galleryItems.filter((i) => i.status === "pending").length
    const aviso = toast.loading(product ? "Guardando cambios…" : "Guardando producto…")

    let saved: Awaited<ReturnType<typeof createProduct>>
    try {
      saved = product ? await updateProduct(product.id, fd) : await createProduct(fd)
    } catch {
      setLoading(false)
      toast.error("Se cortó la conexión y no se guardó el producto. Revisá tu internet y probá de nuevo.", { id: aviso })
      return
    }

    if (saved.error || !saved.id) {
      setLoading(false)
      toast.error(saved.error || "No pudimos guardar el producto. Probá de nuevo.", { id: aviso })
      return
    }

    const productId = saved.id
    // El servidor puede haber desambiguado el slug (alfombra-yute → alfombra-yute-2).
    const finalSlug = saved.slug || slug
    if (finalSlug !== slug) setSlug(finalSlug)

    // ── 2. Subir las imágenes pendientes con el slug definitivo ──────────────
    // Portada y galería en paralelo, ya achicadas en el navegador.
    const failures: string[] = []
    if (pendientes > 0) {
      toast.loading(pendientes === 1 ? "Subiendo la foto…" : `Subiendo ${pendientes} fotos…`, { id: aviso })
    }

    let finalCoverPublicId = uploadedCoverId
    const coverUpload = cover.status === "pending" ? subirFoto(cover.file, finalSlug, "cover") : null

    type GalleryUploadResult =
      | { ok: true; index: number; item: GalleryItem; publicId: string; url: string }
      | { ok: false; index: number; error: string }

    const galleryResults: GalleryUploadResult[] = await Promise.all(
      galleryItems.map((item, i): Promise<GalleryUploadResult> =>
        item.status === "uploaded"
          ? Promise.resolve({ ok: true, index: i, item, publicId: item.publicId, url: item.preview })
          : subirFoto(item.file, finalSlug, "gallery", i).then((result) =>
              result.error
                ? { ok: false, index: i, error: result.error }
                : { ok: true, index: i, item, publicId: result.public_id!, url: result.secure_url! }
            )
      )
    )

    if (coverUpload && cover.status === "pending") {
      const result = await coverUpload
      if (result.error) {
        failures.push(`portada (${result.error})`)
      } else {
        URL.revokeObjectURL(cover.preview)
        finalCoverPublicId = result.public_id!
        setCover({ status: "uploaded", publicId: result.public_id!, preview: result.secure_url! })
      }
    }

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
      try {
        const imgResult = await updateProductImages(productId, {
          cover_image: finalCoverPublicId || null,
          gallery_images: finalGalleryIds,
        })
        if (imgResult.error) failures.push(imgResult.error)
      } catch {
        failures.push("no se pudieron guardar las fotos (se cortó la conexión)")
      }
    }

    setLoading(false)

    const savedLabel = product ? "Producto actualizado" : "Producto creado"
    if (failures.length > 0) {
      // El producto ya está guardado: avisar sin bloquear, se reintenta editando.
      toast.error(`${savedLabel}, pero no se subieron algunas fotos: ${failures.join(", ")}. Editá el producto para reintentar.`, { id: aviso })
    } else if (finalSlug !== slug) {
      toast.success(`${savedLabel}. Su link quedó como /${finalSlug}`, { id: aviso })
    } else {
      toast.success(savedLabel, { id: aviso })
    }
    markClean()
    router.push("/panel/productos")
  }

  const subcategoriasDisponibles = subcategories.filter((s) => s.category_id === selectedCategoryId && s.is_active)

  return (
    <form ref={formRef} onSubmit={handleSubmit} onChange={check} onInput={check} className="relative">
      <UnsavedChangesBar
        visible={dirty}
        saving={loading}
        message={product ? "Cambios sin guardar" : "Producto sin guardar"}
        saveLabel={product ? "Guardar" : "Guardar producto"}
        onDiscard={onDiscard}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── Columna principal ── */}
        <div className="flex min-w-0 flex-col gap-6">
          <FormSection title="Información">
            <Field label="Nombre" htmlFor="name">
              <Input
                id="name"
                name="name"
                required
                defaultValue={product?.name}
                onChange={handleNameChange}
                placeholder="Ej.: Sillón de tres cuerpos"
              />
            </Field>
            <Field
              label="Link del producto"
              htmlFor="slug"
              hint="Se arma solo con el nombre. Solo letras, números y guiones."
            >
              <div className="flex h-10 items-center rounded-[10px] border border-linea bg-fondo-alterno/60 focus-within:border-primario">
                <span className="pl-3 text-sm text-texto-secundario">/producto/</span>
                <input
                  id="slug"
                  name="slug"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="sillon-tres-cuerpos"
                  className="h-full min-w-0 flex-1 bg-transparent pr-3 text-[15px] text-tinta outline-none"
                  readOnly={!!product?.slug && !slugEdited}
                />
              </div>
            </Field>
            <Field label="Descripción corta" htmlFor="short_description" hint="Se ve en las tarjetas del catálogo.">
              <Textarea
                id="short_description"
                name="short_description"
                required
                defaultValue={product?.short_description || ""}
                rows={2}
                placeholder="Una línea que cuente qué es"
              />
            </Field>
            <Field label="Descripción completa" htmlFor="description" hint="Se ve en la página del producto.">
              <Textarea
                id="description"
                name="description"
                required
                defaultValue={product?.description || ""}
                rows={6}
                placeholder="Medidas, materiales, colores y todo lo que te suelen consultar"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Fotos"
            description={`La portada es la que se ve primero. Podés sumar hasta ${MAX_GALLERY} fotos más.`}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-tinta">Portada</p>
                <Dropzone
                  preview={cover.status === "empty" ? null : cover.preview}
                  onFiles={([file]) => onCoverSelected(file)}
                  onRemove={removeCover}
                  disabled={loading}
                  label="Subí la portada"
                  alt="Portada"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-tinta">
                  Galería{" "}
                  <span className="font-normal text-texto-secundario">
                    ({galleryItems.length} de {MAX_GALLERY})
                  </span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: MAX_GALLERY }).map((_, i) => {
                    const item = galleryItems[i]
                    const esSiguiente = i === galleryItems.length
                    return item ? (
                      <Dropzone
                        key={i}
                        compact
                        preview={item.preview}
                        onFiles={() => {}}
                        onRemove={() => removeGalleryItem(i)}
                        disabled={loading}
                        alt={`Foto ${i + 1}`}
                      />
                    ) : (
                      <Dropzone
                        key={i}
                        compact
                        multiple
                        onFiles={onGalleryFiles}
                        disabled={loading || !esSiguiente}
                        label="Agregar fotos a la galería"
                        className={esSiguiente ? undefined : "opacity-40"}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Precio">
            <Field label="Precio" htmlFor="price" optional hint="Sin precio, tus clientes lo consultan por WhatsApp.">
              <div className="flex h-10 max-w-[240px] items-center rounded-[10px] border border-linea bg-white focus-within:border-primario">
                <span className="pl-3 text-sm font-semibold text-texto-secundario">Gs.</span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  inputMode="numeric"
                  defaultValue={product?.price ?? ""}
                  placeholder="0"
                  className="h-full min-w-0 flex-1 bg-transparent px-2 text-[15px] text-tinta outline-none"
                />
              </div>
            </Field>
            <CheckField
              name="show_price"
              label="Mostrar el precio en el catálogo"
              defaultChecked={product?.show_price ?? false}
            />
          </FormSection>
        </div>

        {/* ── Columna lateral ── */}
        <div className="flex flex-col gap-6">
          <FormSection title="Estado">
            <CheckField
              name="is_active"
              label="Activo"
              description="Los inactivos no aparecen en tu catálogo."
              defaultChecked={product?.is_active ?? true}
            />
            <CheckField
              name="is_visible"
              label="Visible"
              description="Ocultalo sin desactivarlo."
              defaultChecked={product?.is_visible ?? true}
            />
            <CheckField
              name="featured"
              label="Destacado"
              description="Aparece primero en el inicio de tu catálogo."
              defaultChecked={product?.featured ?? false}
            />
          </FormSection>

          <FormSection title="Organización">
            <Field label="Categoría" htmlFor="category_id">
              <Select
                name="category_id"
                required
                value={selectedCategoryId || undefined}
                onValueChange={(v) => {
                  setSelectedCategoryId(v)
                  setSelectedSubcategoryId("")
                }}
              >
                <SelectTrigger id="category_id" className="w-full">
                  <SelectValue placeholder="Elegí una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Subcategoría" htmlFor="subcategory_id" optional>
              <Select
                value={selectedSubcategoryId || SIN_SUBCATEGORIA}
                onValueChange={(v) => setSelectedSubcategoryId(v === SIN_SUBCATEGORIA ? "" : v)}
                disabled={subcategoriasDisponibles.length === 0}
              >
                <SelectTrigger id="subcategory_id" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIN_SUBCATEGORIA}>Sin subcategoría</SelectItem>
                  {subcategoriasDisponibles.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Etiquetas" htmlFor="tags" optional hint="Separalas con comas. Ayudan a encontrar el producto.">
              <Input
                id="tags"
                name="tags"
                defaultValue={(product?.tags || []).join(", ")}
                placeholder="living, tela, gris"
              />
            </Field>
          </FormSection>
        </div>
      </div>
    </form>
  )
}
