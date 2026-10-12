"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Product, Category } from "@/lib/types-catalog"
import { toAssetVersion } from "@/lib/types-catalog"
import { buildImageUrl } from "@/lib/media-urls"
import { updateProductImages } from "../../../productos/actions"
import { ProductListPanel } from "./product-list-panel"
import { CoverUpload } from "./cover-upload"
import { GalleryUpload } from "./gallery-upload"
import { BottomActionBar } from "./bottom-action-bar"

interface GalleryItem {
  publicId: string
  preview: string
  label: string
}

interface ProductImageEdit {
  coverPublicId: string | null
  coverPreview: string
  galleryItems: GalleryItem[]
  isDirty: boolean
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface ImageManagerProps {
  products: Product[]
  categories: Category[]
}

export function ImageManager({ products, categories }: ImageManagerProps) {
  const router = useRouter()
  const [displayProducts, setDisplayProducts] = useState<Product[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [localEdits, setLocalEdits] = useState<Record<string, ProductImageEdit>>({})
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")

  // Init: read sessionStorage, filter products, pre-populate edits
  useEffect(() => {
    const stored = sessionStorage.getItem("carga_product_ids")
    let filtered: Product[]

    if (!stored || stored === "ALL") {
      filtered = products
    } else {
      try {
        const ids: string[] = JSON.parse(stored)
        filtered = products.filter((p) => ids.includes(p.id))
      } catch {
        filtered = products
      }
    }

    setDisplayProducts(filtered)

    // Pre-populate edits from existing product data
    const initial: Record<string, ProductImageEdit> = {}
    for (const p of filtered) {
      const version = toAssetVersion(p.updated_at)
      const galleryItems: GalleryItem[] = (p.gallery_images ?? []).map((pid, i) => ({
        publicId: pid,
        preview: buildImageUrl(pid, 400, version),
        label: `Imagen ${String(i + 1).padStart(2, "0")}`,
      }))
      initial[p.id] = {
        coverPublicId: p.cover_image ?? null,
        coverPreview: buildImageUrl(p.cover_image, 800, version),
        galleryItems,
        isDirty: false,
      }
    }
    setLocalEdits(initial)

    if (filtered.length > 0) {
      setSelectedId(filtered[0].id)
    }
  }, [products])

  function updateEdit(id: string, patch: Partial<ProductImageEdit>) {
    setLocalEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch, isDirty: true },
    }))
    setSaveStatus("idle")
  }

  async function saveProduct(id: string): Promise<boolean> {
    const edit = localEdits[id]
    if (!edit) return false

    setSaveStatus("saving")
    const result = await updateProductImages(id, {
      cover_image: edit.coverPublicId,
      gallery_images: edit.galleryItems.map((g) => g.publicId),
    })

    if ("error" in result) {
      setSaveStatus("error")
      toast.error(result.error)
      return false
    }

    setSaveStatus("saved")
    setLocalEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], isDirty: false },
    }))
    return true
  }

  async function handleSaveDraft() {
    if (!selectedId) return
    const ok = await saveProduct(selectedId)
    if (ok) toast.success("Borrador guardado")
  }

  async function handleSaveAndNext() {
    if (!selectedId) return
    const ok = await saveProduct(selectedId)
    if (!ok) return

    const currentIndex = displayProducts.findIndex((p) => p.id === selectedId)
    if (currentIndex < displayProducts.length - 1) {
      setSelectedId(displayProducts[currentIndex + 1].id)
      setSaveStatus("idle")
    } else {
      // Last product — redirect to /carga
      toast.success("¡Gestión de imágenes completada!")
      router.push("/panel/carga")
    }
  }

  const selectedProduct = displayProducts.find((p) => p.id === selectedId) ?? null
  const selectedEdit = selectedId ? localEdits[selectedId] : null
  const currentIndex = displayProducts.findIndex((p) => p.id === selectedId)
  const isLast = currentIndex === displayProducts.length - 1

  const categorySlug =
    selectedProduct?.categories?.slug ??
    categories.find((c) => c.id === selectedProduct?.category_id)?.slug ??
    "sin-categoria"

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Left panel */}
      <ProductListPanel
        products={displayProducts}
        selectedId={selectedId}
        localEdits={localEdits}
        onSelect={(id) => {
          setSelectedId(id)
          setSaveStatus("idle")
        }}
      />

      {/* Right editor */}
      <section className="flex-1 overflow-y-auto p-8 pb-24">
        {selectedProduct && selectedEdit ? (
          <>
            {/* Editor header */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                {categorySlug}
              </p>
              <h1 className="text-xl font-bold text-foreground">{selectedProduct.name}</h1>
              <p className="text-sm text-muted-foreground">{selectedProduct.slug}</p>
            </div>

            {/* Cover upload */}
            <CoverUpload
              coverPublicId={selectedEdit.coverPublicId}
              coverPreview={selectedEdit.coverPreview}
              categorySlug={categorySlug}
              productSlug={selectedProduct.slug}
              onUpdate={({ coverPublicId, coverPreview }) =>
                updateEdit(selectedProduct.id, { coverPublicId, coverPreview })
              }
              onRemove={() =>
                updateEdit(selectedProduct.id, {
                  coverPublicId: null,
                  coverPreview: buildImageUrl(null),
                })
              }
            />

            {/* Gallery upload */}
            <GalleryUpload
              galleryItems={selectedEdit.galleryItems}
              categorySlug={categorySlug}
              productSlug={selectedProduct.slug}
              onUpdate={(galleryItems) =>
                updateEdit(selectedProduct.id, { galleryItems })
              }
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <span className="material-symbols-outlined text-[64px] text-muted-foreground/30">
                image_search
              </span>
              <p className="mt-4 text-sm">Selecciona un producto para gestionar sus imágenes</p>
            </div>
          </div>
        )}
      </section>

      {/* Fixed bottom bar */}
      <BottomActionBar
        isLast={isLast}
        saveStatus={saveStatus}
        onSaveDraft={handleSaveDraft}
        onSaveAndNext={handleSaveAndNext}
      />
    </div>
  )
}
