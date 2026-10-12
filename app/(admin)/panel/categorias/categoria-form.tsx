"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/lib/types-catalog"
import { toAssetVersion } from "@/lib/types-catalog"
import { buildImageUrl } from "@/lib/media-urls"
import { prepararImagen } from "@/lib/image-prep"
import { slugify, sanitizeSlugInput } from "@/lib/slug"
import { createCategory, updateCategory, uploadCategoryImage } from "./actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dropzone } from "@/components/panel/dropzone"
import { CheckField, Field, FormSection } from "@/components/panel/form-section"
import { UnsavedChangesBar, useDirtyForm } from "@/components/panel/unsaved-changes-bar"

interface Props {
  category?: Category
}

/** "Descartar" remonta el formulario con los valores originales. */
export function CategoriaForm(props: Props) {
  const [resetKey, setResetKey] = useState(0)
  return <CategoriaFormInner key={resetKey} {...props} onDiscard={() => setResetKey((k) => k + 1)} />
}

function CategoriaFormInner({ category, onDiscard }: Props & { onDiscard: () => void }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [imagePath, setImagePath] = useState(category?.image_path || "")
  const [imagePreview, setImagePreview] = useState(
    category?.image_path ? buildImageUrl(category.image_path, 400, toAssetVersion(category.updated_at)) : ""
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const [slug, setSlug] = useState(category?.slug || "")
  const [slugEdited, setSlugEdited] = useState(!!category?.slug)

  const { dirty, check, markClean } = useDirtyForm(formRef, { slug, imagePath })

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) setSlug(slugify(e.target.value))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(sanitizeSlugInput(e.target.value))
    setSlugEdited(true)
  }

  const handleFile = useCallback(
    async (file: File) => {
      if (!slug) {
        toast.error("Escribí el nombre antes de subir la foto")
        return
      }
      setUploadingImage(true)
      try {
        const fd = new FormData()
        fd.append("file", await prepararImagen(file))
        fd.append("slug", slug)
        const result = await uploadCategoryImage(fd)
        if (!result.success) {
          toast.error(result.error)
        } else {
          setImagePath(result.public_id)
          setImagePreview(result.secure_url)
        }
      } catch {
        toast.error("No pudimos subir la foto. Revisá tu internet y probá de nuevo.")
      } finally {
        setUploadingImage(false)
      }
    },
    [slug]
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set("slug", slug)
    fd.set("image_path", imagePath)

    let result: { error?: string; success?: boolean }
    try {
      result = category ? await updateCategory(category.id, fd) : await createCategory(fd)
    } catch {
      setLoading(false)
      toast.error("Se cortó la conexión. Revisá tu internet y probá de nuevo.")
      return
    }

    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(category ? "Categoría guardada" : "Categoría creada")
      markClean()
      router.push("/panel/categorias")
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} onChange={check} onInput={check} className="relative">
      <UnsavedChangesBar
        visible={dirty}
        saving={loading}
        message={category ? "Cambios sin guardar" : "Categoría sin guardar"}
        saveLabel={category ? "Guardar" : "Guardar categoría"}
        onDiscard={onDiscard}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <FormSection title="Información">
            <Field label="Nombre" htmlFor="name">
              <Input
                id="name"
                name="name"
                required
                defaultValue={category?.name}
                onChange={handleNameChange}
                placeholder="Ej.: Ropa de verano"
              />
            </Field>
            <Field label="Nombre en el link" htmlFor="slug" hint="Se arma solo con el nombre. Solo letras, números y guiones.">
              <Input id="slug" name="slug" required value={slug} onChange={handleSlugChange} placeholder="ropa-de-verano" />
            </Field>
            <Field label="Descripción" htmlFor="description" optional>
              <Textarea
                id="description"
                name="description"
                defaultValue={category?.description || ""}
                rows={4}
                placeholder="Qué vas a encontrar en esta categoría"
              />
            </Field>
            <Field label="Orden" htmlFor="sort_order" hint="Las de número menor aparecen primero.">
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={category?.sort_order ?? 0}
                className="w-32"
              />
            </Field>
          </FormSection>
        </div>

        <div className="flex flex-col gap-6">
          <FormSection title="Estado">
            <CheckField name="is_active" label="Activa" defaultChecked={category?.is_active ?? true} />
            <CheckField
              name="is_visible"
              label="Visible en el catálogo"
              description="Ocultala sin desactivarla."
              defaultChecked={category?.is_visible ?? true}
            />
          </FormSection>

          <FormSection title="Foto" description="Se muestra en el inicio de tu catálogo.">
            <div className="relative">
              <Dropzone
                preview={imagePreview || null}
                onFiles={([file]) => handleFile(file)}
                onRemove={() => {
                  setImagePath("")
                  setImagePreview("")
                }}
                disabled={uploadingImage || loading}
                label="Subí una foto"
                hint="JPG, PNG o WebP. Ideal 800×800."
                alt="Foto de la categoría"
              />
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[12px] bg-white/80">
                  <Loader2 className="size-6 animate-spin text-primario" />
                </div>
              )}
            </div>
          </FormSection>
        </div>
      </div>

      <input type="hidden" name="image_path" value={imagePath} />
    </form>
  )
}
