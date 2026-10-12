"use client"

import { toAssetVersion } from "@/lib/types-catalog"
import { buildImageUrl } from "@/lib/media-urls"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types-catalog"
import { Thumb } from "@/components/panel/data-table"
import { StatusBadge } from "@/components/panel/status-badge"

interface ProductImageEdit {
  coverPublicId: string | null
  coverPreview: string
  galleryItems: GalleryItem[]
  isDirty: boolean
}

interface GalleryItem {
  publicId: string
  preview: string
  label: string
}

interface ProductListPanelProps {
  products: Product[]
  selectedId: string | null
  localEdits: Record<string, ProductImageEdit>
  onSelect: (id: string) => void
}

export function ProductListPanel({ products, selectedId, localEdits, onSelect }: ProductListPanelProps) {
  const conFoto = products.filter((p) => localEdits[p.id]?.coverPublicId).length

  return (
    <aside className="flex max-h-[360px] flex-col overflow-hidden rounded-[16px] border border-linea lg:sticky lg:top-6 lg:max-h-[calc(100dvh-180px)]">
      <div className="shrink-0 border-b border-linea bg-fondo-alterno px-4 py-3">
        <h2 className="text-sm font-semibold text-tinta">Productos</h2>
        <p className="text-xs text-texto-secundario">
          {conFoto} de {products.length} con portada
        </p>
      </div>
      <ul className="flex-1 divide-y divide-linea overflow-y-auto">
        {products.map((product) => {
          const edit = localEdits[product.id]
          const isComplete = Boolean(edit?.coverPublicId)
          const isSelected = product.id === selectedId

          return (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onSelect(product.id)}
                aria-current={isSelected ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 border-l-4 px-3 py-2.5 text-left transition-colors",
                  isSelected ? "border-l-primario bg-accent" : "border-l-transparent hover:bg-fondo-alterno"
                )}
              >
                <Thumb
                  src={edit?.coverPublicId ? buildImageUrl(edit.coverPublicId, 128, toAssetVersion(product.updated_at)) : null}
                  alt={product.name}
                  size={44}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-tinta">{product.name}</span>
                  <span className="block truncate text-xs text-texto-secundario">
                    {edit?.isDirty ? "Cambios sin guardar" : product.slug}
                  </span>
                </span>
                <StatusBadge tone={isComplete ? "exito" : "aviso"} className="shrink-0">
                  {isComplete ? "Lista" : "Falta foto"}
                </StatusBadge>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
