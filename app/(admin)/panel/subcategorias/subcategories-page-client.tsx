"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Subcategory, Category } from "@/lib/types-catalog"
import { deleteSubcategory } from "./actions"
import { Button } from "@/components/ui/button"
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
import { Pencil, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"

interface Props {
  subcategories: Subcategory[]
  categories: Category[]
}

export function SubcategoriesPageClient({ subcategories, categories }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  function getCategoryName(categoryId: string) {
    return categories.find((c) => c.id === categoryId)?.name ?? categoryId
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const result = await deleteSubcategory(id)
    setDeleting(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Subcategoría eliminada")
      router.refresh()
    }
  }

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Subcategorías</h1>
          <p className="text-sm text-muted-foreground mt-1">{subcategories.length} subcategoría{subcategories.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/panel/subcategorias/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Subcategoría
          </Link>
        </Button>
      </div>

      {/* Table */}
      {subcategories.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">No hay subcategorías aún.</p>
          <Button asChild>
            <Link href="/panel/subcategorias/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Crear primera subcategoría
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Orden</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((sub) => (
                <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{sub.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{getCategoryName(sub.category_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{sub.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sub.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        sub.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {sub.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/panel/subcategorias/${sub.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar subcategoría?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará la subcategoría <strong>{sub.name}</strong> permanentemente.
                              Los productos asociados quedarán sin subcategoría.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(sub.id)}
                              disabled={deleting === sub.id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleting === sub.id ? "Eliminando..." : "Eliminar"}
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
