"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Product, Category } from "@/lib/types-catalog"
import { buildCloudinaryUrl, toAssetVersion } from "@/lib/types-catalog"
import { deleteProduct, toggleProductActive } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Plus, ImageOff, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "sonner"

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
    if (filterActive !== "") {
      if (filterActive === "true" && !p.is_active) return false
      if (filterActive === "false" && p.is_active) return false
    }
    if (filterFeatured !== "") {
      if (filterFeatured === "true" && !p.featured) return false
      if (filterFeatured === "false" && p.featured) return false
    }
    return true
  })

  async function handleDelete(id: string) {
    setDeleting(id)
    const result = await deleteProduct(id)
    setDeleting(null)
    if (result.error) toast.error(result.error)
    else { toast.success("Producto eliminado"); router.refresh() }
  }

  async function handleToggle(id: string, current: boolean) {
    setToggling(id)
    const result = await toggleProductActive(id, !current)
    setToggling(null)
    if (result.error) toast.error(result.error)
    else { toast.success(current ? "Producto desactivado" : "Producto activado"); router.refresh() }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} de {products.length} producto{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {extraActions}
          <Button asChild>
            <Link href="/panel/productos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Buscar por nombre o slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <select
          value={filterFeatured}
          onChange={(e) => setFilterFeatured(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Todos</option>
          <option value="true">Destacados</option>
          <option value="false">No destacados</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {products.length === 0 ? "No hay productos aún." : "No se encontraron resultados."}
          </p>
          {products.length === 0 && (
            <Button asChild>
              <Link href="/panel/productos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Crear primer producto
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-16">Img</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Precio</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Destacado</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.cover_image ? (
                        <img
                          src={buildCloudinaryUrl(product.cover_image, 80, toAssetVersion(product.updated_at))}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground font-mono" title="Slug">{product.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(product.categories as any)?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.price != null
                      ? product.show_price
                        ? `Gs. ${product.price.toLocaleString()}`
                        : <span className="text-xs">Gs. {product.price.toLocaleString()} <span className="text-muted-foreground/60">(oculto)</span></span>
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.featured ? (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                        Destacado
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggle(product.id, product.is_active)}
                        disabled={toggling === product.id}
                        title={product.is_active ? "Desactivar" : "Activar"}
                      >
                        {product.is_active
                          ? <ToggleRight className="h-4 w-4 text-green-600" />
                          : <ToggleLeft className="h-4 w-4 text-gray-400" />
                        }
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/panel/productos/${product.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará <strong>{product.name}</strong> permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              disabled={deleting === product.id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleting === product.id ? "Eliminando..." : "Eliminar"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
