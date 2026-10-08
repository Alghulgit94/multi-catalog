"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Category } from "@/lib/types-catalog"
import { buildCloudinaryUrl, toAssetVersion } from "@/lib/types-catalog"
import { createCategory, updateCategory, uploadCategoryImage } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { slugify, sanitizeSlugInput } from "@/lib/slug"
import { useSidebar } from "@/contexts/sidebar-context"

interface Props {
  category?: Category
}

export function CategoriaForm({ category }: Props) {
  const router = useRouter()
  const { isCollapsed } = useSidebar()
  const [loading, setLoading] = useState(false)
  const [imagePath, setImagePath] = useState(category?.image_path || "")
  const [imagePreview, setImagePreview] = useState(
    category?.image_path
      ? buildCloudinaryUrl(category.image_path, 400, toAssetVersion(category.updated_at))
      : ""
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const [slug, setSlug] = useState(category?.slug || "")
  const [slugEdited, setSlugEdited] = useState(!!category?.slug)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) {
      setSlug(slugify(e.target.value))
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(sanitizeSlugInput(e.target.value))
    setSlugEdited(true)
  }

  const handleFileDrop = useCallback(
    async (file: File) => {
      if (!slug) {
        toast.error("Ingresa el slug antes de subir la imagen")
        return
      }
      setUploadingImage(true)
      const fd = new FormData()
      fd.append("file", file)
      fd.append("slug", slug)
      const result = await uploadCategoryImage(fd)
      setUploadingImage(false)
      if (!result.success) {
        toast.error(result.error)
      } else {
        setImagePath(result.public_id)
        setImagePreview(result.secure_url)
        toast.success("Imagen subida")
      }
    },
    [slug]
  )

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileDrop(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileDrop(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set("slug", slug)
    fd.set("image_path", imagePath)

    let result
    if (category) {
      result = await updateCategory(category.id, fd)
    } else {
      result = await createCategory(fd)
    }

    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(category ? "Categoría actualizada" : "Categoría creada")
      router.push("/panel/categorias")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pb-28">
      <div className="px-8 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Columna 2/3 ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Card: Campos principales */}
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="px-6 pt-6 pb-4 border-b">
                <h2 className="font-semibold text-base">Información de la Categoría</h2>
              </div>
              <div className="p-6 space-y-6">

                {/* Nombre */}
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre de la categoría *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={category?.name}
                    onChange={handleNameChange}
                    placeholder="Ej. Ropa de verano"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="relative">
                    <Input
                      id="slug"
                      name="slug"
                      required
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="ropa-de-verano"
                      className="pr-9 font-mono text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground text-[16px]">lock</span>
                  </div>
                  <p className="text-xs text-muted-foreground">El slug se genera automáticamente para la URL.</p>
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={category?.description || ""}
                    rows={4}
                    placeholder="Descripción opcional de la categoría"
                  />
                </div>

                {/* Orden */}
                <div className="space-y-1.5">
                  <Label htmlFor="sort_order">Orden de visualización</Label>
                  <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    defaultValue={category?.sort_order ?? 0}
                    className="w-40"
                  />
                  <p className="text-xs text-muted-foreground">Menor número aparece primero</p>
                </div>
              </div>
            </div>

            {/* Card: Estado y Visibilidad */}
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="px-6 pt-6 pb-4 border-b">
                <h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Estado y Visibilidad</h2>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { name: "is_active", label: "Activa", default: category?.is_active ?? true },
                  { name: "is_visible", label: "Visible en el sitio", default: category?.is_visible ?? true },
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

          {/* ── Columna 1/3 ── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Card: Imagen de Categoría */}
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="px-6 pt-6 pb-4 border-b">
                <h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Imagen de Categoría</h2>
              </div>
              <div className="p-6 space-y-3">
                {imagePreview ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden border shadow-sm group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => { setImagePath(""); setImagePreview("") }}
                        className="rounded-full bg-destructive text-white p-2 shadow"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={onDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    {uploadingImage ? (
                      <span className="text-sm text-muted-foreground">Subiendo...</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-muted-foreground text-[36px]">cloud_upload</span>
                        <p className="text-sm font-medium text-muted-foreground">Subir imagen</p>
                        <p className="text-xs text-muted-foreground/70 text-center px-3">JPG, PNG o WebP. Recomendado 800×800px.</p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  Seleccionar de la biblioteca
                </Button>
              </div>
            </div>

            {/* Box: Consejo */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <span className="text-sm font-semibold">Consejo</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Elegí un nombre claro para tu catálogo. El slug se usa en las URLs del sitio, mantenlo simple y sin caracteres especiales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden image_path field */}
      <input type="hidden" name="image_path" value={imagePath} />

      {/* ── Footer fijo ── */}
      <footer
        className="fixed bottom-0 right-0 h-20 bg-white border-t flex items-center justify-end px-8 gap-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-[left]"
        style={{ left: isCollapsed ? "4rem" : "16rem" }}
      >
        <Button type="button" variant="ghost" onClick={() => router.push("/panel/categorias")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <span className="material-symbols-outlined text-sm mr-2">save</span>
          {loading ? "Guardando..." : category ? "Actualizar Categoría" : "Crear Categoría"}
        </Button>
      </footer>
    </form>
  )
}
