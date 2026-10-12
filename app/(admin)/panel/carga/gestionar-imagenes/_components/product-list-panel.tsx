"use client"

import { toAssetVersion } from "@/lib/types-catalog"
import { buildImageUrl } from "@/lib/media-urls"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types-catalog"

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

export function ProductListPanel({
  products,
  selectedId,
  localEdits,
  onSelect,
}: ProductListPanelProps) {
  return (
    <aside className="w-[400px] shrink-0 border-r border-border bg-white flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold text-foreground">Productos</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {products.length} producto{products.length !== 1 ? "s" : ""} para gestionar
        </p>
      </div>
      <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
        {products.map((product) => {
          const edit = localEdits[product.id]
          const isComplete = Boolean(edit?.coverPublicId)
          const isSelected = product.id === selectedId
          const thumbUrl = edit?.coverPublicId
            ? buildImageUrl(edit.coverPublicId, 128, toAssetVersion(product.updated_at))
            : buildImageUrl(null, 128)

          return (
            <button
              key={product.id}
              onClick={() => onSelect(product.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4",
                isSelected
                  ? "border-l-primary bg-primary/5"
                  : "border-l-transparent hover:bg-slate-50"
              )}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                <img
                  src={thumbUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground truncate">{product.slug}</p>
              </div>

              {/* Status badge */}
              <span
                className={cn(
                  "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                  isComplete
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {isComplete ? "Completado" : "Pendiente"}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
