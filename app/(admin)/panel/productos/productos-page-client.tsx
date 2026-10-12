"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Pencil, Plus, Search, Star } from "lucide-react"
import { toast } from "sonner"
import type { Product, Category } from "@/lib/types-catalog"
import { toAssetVersion } from "@/lib/types-catalog"
import { buildImageUrl } from "@/lib/media-urls"
import { formatoGs } from "@/config/planes"
import { deleteProduct, toggleProductActive } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmDelete } from "@/components/panel/confirm-delete"
import { DataTable, Td, Th, Thumb, Tr } from "@/components/panel/data-table"
import { EmptyState } from "@/components/panel/empty-state"
import { FilterSelect } from "@/components/panel/filter-select"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { StatusBadge } from "@/components/panel/status-badge"
import { SECCION_ICONOS } from "@/components/panel/nav"

interface Props {
  products: Product[]
  categories: Category[]
  extraActions?: React.ReactNode
}

export function ProductosPageClient({ products, categories, extraActions }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterActive, setFilterActive] = useState("")
  const [filterFeatured, setFilterFeatured] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const filtered = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false
    }
    if (filterCategory && p.category_id !== filterCategory) return false
    if (filterActive === "true" && !p.is_active) return false
    if (filterActive === "false" && p.is_active) return false
    if (filterFeatured === "true" && !p.featured) return false
    if (filterFeatured === "false" && p.featured) return false
    return true
  })

  const hayFiltros = Boolean(search || filterCategory || filterActive || filterFeatured)

  function limpiarFiltros() {
    setSearch("")
    setFilterCategory("")
    setFilterActive("")
    setFilterFeatured("")
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const result = await deleteProduct(id)
    setDeleting(null)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Producto eliminado")
      router.refresh()
    }
  }

  async function handleToggle(id: string, current: boolean) {
    setToggling(id)
    const result = await toggleProductActive(id, !current)
    setToggling(null)
    if (result.error) toast.error(result.error)
    else {
      toast.success(current ? "Producto desactivado" : "Producto activado")
      router.refresh()
    }
  }

  const nuevo = (
    <Button asChild>
      <Link href="/panel/productos/nuevo">
        <Plus /> Nuevo producto
      </Link>
    </Button>
  )

  return (
    <PageContainer>
      <PageHeader
        title="Productos"
        icon={SECCION_ICONOS.productos}
        description={
          products.length > 0
            ? `${products.length} producto${products.length !== 1 ? "s" : ""} en tu catálogo`
            : "Lo que cargues acá aparece en tu catálogo."
        }
        actions={
          <>
            {extraActions}
            {products.length > 0 && nuevo}
          </>
        }
      />

      <div className="mt-6">
        {products.length === 0 ? (
          <EmptyState
            illustration="productos"
            title="Cargá tu primer producto"
            description="Con un nombre, una foto y el precio alcanza para empezar. Después podés sumar más detalles."
            actions={nuevo}
          />
        ) : (
          <DataTable
            toolbar={
              <>
                <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-secundario" strokeWidth={1.5} />
                  <Input
                    placeholder="Buscar por nombre"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 pl-9 text-sm"
                    aria-label="Buscar productos"
                  />
                </div>
                <FilterSelect
                  label="Filtrar por categoría"
                  value={filterCategory}
                  onChange={setFilterCategory}
                  allLabel="Todas las categorías"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
                <FilterSelect
                  label="Filtrar por estado"
                  value={filterActive}
                  onChange={setFilterActive}
                  allLabel="Todos los estados"
                  options={[
                    { value: "true", label: "Activos" },
                    { value: "false", label: "Inactivos" },
                  ]}
                />
                <FilterSelect
                  label="Filtrar destacados"
                  value={filterFeatured}
                  onChange={setFilterFeatured}
                  allLabel="Destacados y no"
                  options={[
                    { value: "true", label: "Destacados" },
                    { value: "false", label: "No destacados" },
                  ]}
                />
                {hayFiltros && (
                  <span className="ml-auto text-xs text-texto-secundario">
                    {filtered.length} de {products.length}
                  </span>
                )}
              </>
            }
          >
            {filtered.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      bordered={false}
                      illustration="busqueda"
                      title="No encontramos productos"
                      description="Probá con otra búsqueda o cambiá los filtros."
                      actions={
                        <Button variant="outline" onClick={limpiarFiltros}>
                          Borrar búsqueda y filtros
                        </Button>
                      }
                    />
                  </td>
                </tr>
              </tbody>
            ) : (
              <>
                <thead>
                  <tr>
                    <Th>Producto</Th>
                    <Th className="hidden md:table-cell">Categoría</Th>
                    <Th className="hidden sm:table-cell">Precio</Th>
                    <Th>Estado</Th>
                    <Th className="text-right">
                      <span className="sr-only">Acciones</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <Tr key={product.id}>
                      <Td>
                        <Link href={`/panel/productos/${product.id}`} className="flex items-center gap-3">
                          <Thumb
                            src={product.cover_image ? buildImageUrl(product.cover_image, 80, toAssetVersion(product.updated_at)) : null}
                            alt={product.name}
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold hover:underline">{product.name}</span>
                            <span className="block truncate text-xs text-texto-secundario">/{product.slug}</span>
                          </span>
                        </Link>
                      </Td>
                      <Td className="hidden text-texto-secundario md:table-cell">{product.categories?.name || "—"}</Td>
                      <Td className="hidden whitespace-nowrap sm:table-cell">
                        {product.price != null ? (
                          <span className={product.show_price ? "" : "text-texto-secundario"}>
                            {formatoGs(product.price)}
                            {!product.show_price && <span className="ml-1 text-xs">(oculto)</span>}
                          </span>
                        ) : (
                          <span className="text-texto-secundario">Sin precio</span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1.5">
                          <StatusBadge tone={product.is_active ? "exito" : "neutro"}>
                            {product.is_active ? "Activo" : "Inactivo"}
                          </StatusBadge>
                          {product.featured && (
                            <StatusBadge tone="aviso">
                              <Star className="size-3" strokeWidth={2} /> Destacado
                            </StatusBadge>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggle(product.id, product.is_active)}
                            disabled={toggling === product.id}
                            aria-label={product.is_active ? "Desactivar" : "Activar"}
                            title={product.is_active ? "Desactivar" : "Activar"}
                          >
                            {product.is_active ? <EyeOff strokeWidth={1.5} /> : <Eye strokeWidth={1.5} />}
                          </Button>
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link href={`/panel/productos/${product.id}`} aria-label="Editar" title="Editar">
                              <Pencil strokeWidth={1.5} />
                            </Link>
                          </Button>
                          <ConfirmDelete
                            title="¿Eliminar este producto?"
                            description={
                              <>
                                <strong className="text-tinta">{product.name}</strong> y sus fotos se borran de tu catálogo. No se puede deshacer.
                              </>
                            }
                            onConfirm={() => handleDelete(product.id)}
                            pending={deleting === product.id}
                          />
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </>
            )}
          </DataTable>
        )}
      </div>
    </PageContainer>
  )
}
