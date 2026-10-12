"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import type { Subcategory, Category } from "@/lib/types-catalog"
import { slugify, sanitizeSlugInput } from "@/lib/slug"
import { createSubcategory, updateSubcategory } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/panel/empty-state"
import { CheckField, Field, FormSection } from "@/components/panel/form-section"
import { UnsavedChangesBar, useDirtyForm } from "@/components/panel/unsaved-changes-bar"

interface Props {
  subcategory?: Subcategory
  categories: Category[]
}

/** "Descartar" remonta el formulario con los valores originales. */
export function SubcategoryForm(props: Props) {
  const [resetKey, setResetKey] = useState(0)
  return <SubcategoryFormInner key={resetKey} {...props} onDiscard={() => setResetKey((k) => k + 1)} />
}

function SubcategoryFormInner({ subcategory, categories, onDiscard }: Props & { onDiscard: () => void }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState(subcategory?.slug || "")
  const [slugEdited, setSlugEdited] = useState(!!subcategory?.slug)
  const [categoryId, setCategoryId] = useState(subcategory?.category_id || "")

  const { dirty, check, markClean } = useDirtyForm(formRef, { slug, categoryId })

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) setSlug(slugify(e.target.value))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(sanitizeSlugInput(e.target.value))
    setSlugEdited(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!categoryId) {
      toast.error("Elegí la categoría a la que pertenece")
      return
    }
    setLoading(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set("slug", slug)
    fd.set("category_id", categoryId)
    fd.set("is_active", form.querySelector<HTMLInputElement>('[name="is_active"]')?.checked ? "true" : "false")

    let result: Awaited<ReturnType<typeof createSubcategory>>
    try {
      result = subcategory ? await updateSubcategory(subcategory.id, fd) : await createSubcategory(fd)
    } catch {
      setLoading(false)
      toast.error("Se cortó la conexión. Revisá tu internet y probá de nuevo.")
      return
    }

    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      const finalSlug = result.slug || slug
      if (finalSlug !== slug) setSlug(finalSlug)
      const label = subcategory ? "Subcategoría guardada" : "Subcategoría creada"
      toast.success(finalSlug !== slug ? `${label}. Su link quedó como ${finalSlug}` : label)
      markClean()
      router.push("/panel/subcategorias")
    }
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        illustration="categorias"
        title="Primero creá una categoría"
        description="Las subcategorías ordenan productos dentro de una categoría. Por ejemplo, Cuadros dentro de Decoración."
        actions={
          <>
            <Button asChild>
              <Link href="/panel/categorias/nueva">
                <Plus /> Crear categoría
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/panel/subcategorias">Volver</Link>
            </Button>
          </>
        }
      />
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} onChange={check} onInput={check} className="relative">
      <UnsavedChangesBar
        visible={dirty}
        saving={loading}
        message={subcategory ? "Cambios sin guardar" : "Subcategoría sin guardar"}
        saveLabel={subcategory ? "Guardar" : "Guardar subcategoría"}
        onDiscard={onDiscard}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <FormSection title="Información">
          <Field label="Categoría" htmlFor="category_id" hint="La categoría a la que pertenece.">
            <Select value={categoryId || undefined} onValueChange={setCategoryId}>
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
          <Field label="Nombre" htmlFor="name">
            <Input
              id="name"
              name="name"
              required
              defaultValue={subcategory?.name}
              onChange={handleNameChange}
              placeholder="Ej.: Cuadros"
            />
          </Field>
          <Field label="Nombre en el link" htmlFor="slug" hint="Se arma solo con el nombre. Tiene que ser único.">
            <Input id="slug" name="slug" required value={slug} onChange={handleSlugChange} placeholder="cuadros" />
          </Field>
          <Field label="Orden" htmlFor="sort_order" hint="Las de número menor aparecen primero.">
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={subcategory?.sort_order ?? 0}
              className="w-32"
            />
          </Field>
        </FormSection>

        <div className="flex flex-col gap-6">
          <FormSection title="Estado">
            <CheckField
              name="is_active"
              label="Activa"
              description="Las inactivas no aparecen en el catálogo."
              defaultChecked={subcategory?.is_active ?? true}
            />
          </FormSection>
        </div>
      </div>
    </form>
  )
}
