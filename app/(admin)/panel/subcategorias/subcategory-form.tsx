"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Subcategory, Category } from "@/lib/types-catalog"
import { createSubcategory, updateSubcategory } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { slugify, sanitizeSlugInput } from "@/lib/slug"
import { useSidebar } from "@/contexts/sidebar-context"

interface Props {
  subcategory?: Subcategory
  categories: Category[]
}

export function SubcategoryForm({ subcategory, categories }: Props) {
  const router = useRouter()
  const { isCollapsed } = useSidebar()
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState(subcategory?.slug || "")
  const [slugEdited, setSlugEdited] = useState(!!subcategory?.slug)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) {
      setSlug(slugify(e.target.value))
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(sanitizeSlugInput(e.target.value))
    setSlugEdited(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set("slug", slug)

    if (!fd.has("is_active")) fd.set("is_active", "false")
    if (form.querySelector<HTMLInputElement>('[name="is_active"]')?.checked) fd.set("is_active", "true")

    const result = subcategory
      ? await updateSubcategory(subcategory.id, fd)
      : await createSubcategory(fd)

    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      const finalSlug = result.slug || slug
      if (finalSlug !== slug) setSlug(finalSlug)
      const label = subcategory ? "Subcategoría actualizada" : "Subcategoría creada"
      toast.success(finalSlug !== slug ? `${label} con el slug «${finalSlug}»` : label)
      router.push("/panel/subcategorias")
    }
  }

  if (categories.length === 0) {
    return (
      <div className="px-8 mt-2">
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <span className="material-symbols-outlined text-muted-foreground text-[64px]">category</span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">No hay categorías creadas</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Debés crear al menos una categoría antes de poder agregar una subcategoría.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button asChild>
              <Link href="/panel/carga/categoria">
                <span className="material-symbols-outlined text-sm mr-2">add</span>
                Crear categoría
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/panel/subcategorias">Cancelar</Link>
            </Button>
          </div>
        </div>
      </div>
    )
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
                <h2 className="font-semibold text-base">Información de la Subcategoría</h2>
              </div>
              <div className="p-6 space-y-6">

                {/* Categoría padre */}
                <div className="space-y-1.5">
                  <Label htmlFor="category_id">Categoría *</Label>
                  <select
                    id="category_id"
                    name="category_id"
                    required
                    defaultValue={subcategory?.category_id || ""}
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

                {/* Nombre */}
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre de la subcategoría *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={subcategory?.name}
                    onChange={handleNameChange}
                    placeholder="Ej. CUADROS"
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
                      placeholder="cuadros"
                      className="pr-9 font-mono text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground text-[16px]">lock</span>
                  </div>
                  <p className="text-xs text-muted-foreground">El slug se genera automáticamente. Debe ser único.</p>
                </div>

                {/* Orden */}
                <div className="space-y-1.5">
                  <Label htmlFor="sort_order">Orden de visualización</Label>
                  <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    defaultValue={subcategory?.sort_order ?? 0}
                    className="w-40"
                  />
                  <p className="text-xs text-muted-foreground">Menor número aparece primero</p>
                </div>
              </div>
            </div>

            {/* Card: Estado */}
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="px-6 pt-6 pb-4 border-b">
                <h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Estado</h2>
              </div>
              <div className="p-6">
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      name="is_active"
                      value="true"
                      defaultChecked={subcategory?.is_active ?? true}
                      className="peer h-5 w-5 appearance-none rounded border border-input bg-white checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                    />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 text-white">
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </span>
                  </div>
                  <span className="text-sm font-medium group-hover:text-foreground/80 transition-colors">Activa</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── Columna 1/3 ── */}
          <div className="lg:col-span-1">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <span className="text-sm font-semibold">Acerca de las Subcategorías</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Las subcategorías permiten clasificar productos dentro de una categoría. Por ejemplo, dentro de la categoría Decoración pueden existir subcategorías como Cuadros o Cestas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer fijo ── */}
      <footer
        className="fixed bottom-0 right-0 h-20 bg-white border-t flex items-center justify-end px-8 gap-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-[left]"
        style={{ left: isCollapsed ? "4rem" : "16rem" }}
      >
        <Button type="button" variant="ghost" onClick={() => router.push("/panel/subcategorias")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <span className="material-symbols-outlined text-sm mr-2">save</span>
          {loading ? "Guardando..." : subcategory ? "Actualizar Subcategoría" : "Crear Subcategoría"}
        </Button>
      </footer>
    </form>
  )
}
