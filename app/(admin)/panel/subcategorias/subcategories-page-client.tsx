"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Subcategory, Category } from "@/lib/types-catalog"
import { deleteSubcategory } from "./actions"
import { Button } from "@/components/ui/button"
import { ConfirmDelete } from "@/components/panel/confirm-delete"
import { DataTable, Td, Th, Tr } from "@/components/panel/data-table"
import { EmptyState } from "@/components/panel/empty-state"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { StatusBadge } from "@/components/panel/status-badge"
import { SECCION_ICONOS } from "@/components/panel/nav"

interface Props {
  subcategories: Subcategory[]
  categories: Category[]
}

export function SubcategoriesPageClient({ subcategories, categories }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  function getCategoryName(categoryId: string) {
    return categories.find((c) => c.id === categoryId)?.name ?? "—"
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const result = await deleteSubcategory(id).catch(() => ({ error: "Se cortó la conexión. Revisá tu internet y probá de nuevo." }))
    setDeleting(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Subcategoría eliminada")
      router.refresh()
    }
  }

  const nueva = (
    <Button asChild>
      <Link href="/panel/subcategorias/nueva">
        <Plus /> Nueva subcategoría
      </Link>
    </Button>
  )

  return (
    <PageContainer>
      <PageHeader
        title="Subcategorías"
        icon={SECCION_ICONOS.subcategorias}
        description={
          subcategories.length > 0
            ? `${subcategories.length} subcategoría${subcategories.length !== 1 ? "s" : ""}. Ordenan los productos dentro de cada categoría.`
            : "Ordenan los productos dentro de cada categoría."
        }
        actions={subcategories.length > 0 && nueva}
      />

      <div className="mt-6">
        {subcategories.length === 0 ? (
          <EmptyState
            illustration="categorias"
            title="Todavía no tenés subcategorías"
            description="Son opcionales. Sirven para ordenar mejor, por ejemplo Cuadros y Espejos dentro de Decoración."
            actions={nueva}
          />
        ) : (
          <DataTable>
            <thead>
              <tr>
                <Th>Subcategoría</Th>
                <Th className="hidden sm:table-cell">Categoría</Th>
                <Th className="hidden md:table-cell">Orden</Th>
                <Th>Estado</Th>
                <Th className="text-right">
                  <span className="sr-only">Acciones</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((sub) => (
                <Tr key={sub.id}>
                  <Td>
                    <Link href={`/panel/subcategorias/${sub.id}`} className="block min-w-0">
                      <span className="block truncate font-semibold hover:underline">{sub.name}</span>
                      <span className="block truncate text-xs text-texto-secundario">{sub.slug}</span>
                    </Link>
                  </Td>
                  <Td className="hidden text-texto-secundario sm:table-cell">
                    {sub.categories?.name ?? getCategoryName(sub.category_id)}
                  </Td>
                  <Td className="hidden text-texto-secundario md:table-cell">{sub.sort_order}</Td>
                  <Td>
                    <StatusBadge tone={sub.is_active ? "exito" : "neutro"}>{sub.is_active ? "Activa" : "Inactiva"}</StatusBadge>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/panel/subcategorias/${sub.id}`} aria-label="Editar" title="Editar">
                          <Pencil strokeWidth={1.5} />
                        </Link>
                      </Button>
                      <ConfirmDelete
                        title="¿Eliminar esta subcategoría?"
                        description={
                          <>
                            Se borra <strong className="text-tinta">{sub.name}</strong>. Sus productos quedan sin subcategoría, en
                            la misma categoría. No se puede deshacer.
                          </>
                        }
                        onConfirm={() => handleDelete(sub.id)}
                        pending={deleting === sub.id}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>
    </PageContainer>
  )
}
