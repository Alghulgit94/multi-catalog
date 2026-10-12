"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/lib/types-catalog"
import { toAssetVersion } from "@/lib/types-catalog"
import { buildImageUrl } from "@/lib/media-urls"
import { deleteCategory } from "./actions"
import { Button } from "@/components/ui/button"
import { ConfirmDelete } from "@/components/panel/confirm-delete"
import { DataTable, Td, Th, Thumb, Tr } from "@/components/panel/data-table"
import { EmptyState } from "@/components/panel/empty-state"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { StatusBadge } from "@/components/panel/status-badge"
import { SECCION_ICONOS } from "@/components/panel/nav"

interface Props {
  categories: Category[]
}

export function CategoriasPageClient({ categories }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    const result = await deleteCategory(id)
    setDeleting(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Categoría eliminada")
      router.refresh()
    }
  }

  const nueva = (
    <Button asChild>
      <Link href="/panel/categorias/nueva">
        <Plus /> Nueva categoría
      </Link>
    </Button>
  )

  return (
    <PageContainer>
      <PageHeader
        title="Categorías"
        icon={SECCION_ICONOS.categorias}
        description={
          categories.length > 0
            ? `${categories.length} categoría${categories.length !== 1 ? "s" : ""}. Ordenan los productos de tu catálogo.`
            : "Ordenan los productos de tu catálogo."
        }
        actions={categories.length > 0 && nueva}
      />

      <div className="mt-6">
        {categories.length === 0 ? (
          <EmptyState
            illustration="categorias"
            title="Creá tu primera categoría"
            description="Por ejemplo: Living, Dormitorio, Decoración. Cada producto va en una categoría."
            actions={nueva}
          />
        ) : (
          <DataTable>
            <thead>
              <tr>
                <Th>Categoría</Th>
                <Th className="hidden sm:table-cell">Orden</Th>
                <Th>Estado</Th>
                <Th className="text-right">
                  <span className="sr-only">Acciones</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <Tr key={cat.id}>
                  <Td>
                    <Link href={`/panel/categorias/${cat.id}`} className="flex items-center gap-3">
                      <Thumb
                        src={cat.image_path ? buildImageUrl(cat.image_path, 80, toAssetVersion(cat.updated_at)) : null}
                        alt={cat.name}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold hover:underline">{cat.name}</span>
                        <span className="block truncate text-xs text-texto-secundario">{cat.slug}</span>
                      </span>
                    </Link>
                  </Td>
                  <Td className="hidden text-texto-secundario sm:table-cell">{cat.sort_order}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge tone={cat.is_active ? "exito" : "neutro"}>{cat.is_active ? "Activa" : "Inactiva"}</StatusBadge>
                      {cat.is_active && !cat.is_visible && <StatusBadge tone="neutro">Oculta</StatusBadge>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/panel/categorias/${cat.id}`} aria-label="Editar" title="Editar">
                          <Pencil strokeWidth={1.5} />
                        </Link>
                      </Button>
                      <ConfirmDelete
                        title="¿Eliminar esta categoría?"
                        description={
                          <>
                            Se borra <strong className="text-tinta">{cat.name}</strong>. Solo se puede eliminar si no tiene
                            productos. No se puede deshacer.
                          </>
                        }
                        onConfirm={() => handleDelete(cat.id)}
                        pending={deleting === cat.id}
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
