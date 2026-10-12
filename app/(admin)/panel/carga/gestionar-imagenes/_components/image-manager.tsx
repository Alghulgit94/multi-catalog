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
import { EmptyState } from "@/components/panel/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
        label: `Foto ${i + 1}`,
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
    let result: Awaited<ReturnType<typeof updateProductImages>>
    try {
      result = await updateProductImages(id, {
        cover_image: edit.coverPublicId,
        gallery_images: edit.galleryItems.map((g) => g.publicId),
      })
    } catch {
      setSaveStatus("error")
      toast.error("Se cortó la conexión. Revisá tu internet y probá de nuevo.")
      return false
    }

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
    if (ok) toast.success("Fotos guardadas")
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
      // Último producto: vuelve al listado.
      toast.success("Listo, guardaste las fotos de todos los productos")
      router.push("/panel/productos")
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

  if (displayProducts.length === 0 && products.length === 0) {
    return (
      <EmptyState
        className="mt-6"
        illustration="fotos"
        title="Primero cargá productos"
        description="Cuando tengas productos, acá les vas a poder subir la portada y la galería."
        actions={
          <Button asChild>
            <Link href="/panel/productos/nuevo">Agregar producto</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <ProductListPanel
          products={displayProducts}
          selectedId={selectedId}
          localEdits={localEdits}
          onSelect={(id) => {
            setSelectedId(id)
            setSaveStatus("idle")
          }}
        />

        <section className="min-w-0">
          {selectedProduct && selectedEdit ? (
            <>
              <div className="mb-6">
                <p className="text-sm text-texto-secundario">
                  {selectedProduct.categories?.name ?? categories.find((c) => c.id === selectedProduct.category_id)?.name}
                </p>
                <h2 className="font-titulos text-2xl font-bold tracking-[-0.01em] text-tinta">{selectedProduct.name}</h2>
              </div>

              <CoverUpload
                coverPublicId={selectedEdit.coverPublicId}
                coverPreview={selectedEdit.coverPreview}
                categorySlug={categorySlug}
                productSlug={selectedProduct.slug}
                onUpdate={({ coverPublicId, coverPreview }) => updateEdit(selectedProduct.id, { coverPublicId, coverPreview })}
                onRemove={() =>
                  updateEdit(selectedProduct.id, {
                    coverPublicId: null,
                    coverPreview: buildImageUrl(null),
                  })
                }
              />

              <GalleryUpload
                galleryItems={selectedEdit.galleryItems}
                categorySlug={categorySlug}
                productSlug={selectedProduct.slug}
                onUpdate={(galleryItems) => updateEdit(selectedProduct.id, { galleryItems })}
              />
            </>
          ) : (
            <EmptyState illustration="fotos" title="Elegí un producto" description="Seleccioná un producto de la lista para cargarle fotos." />
          )}
        </section>
      </div>

      <BottomActionBar
        isLast={isLast}
        saveStatus={saveStatus}
        dirty={Boolean(selectedEdit?.isDirty)}
        onSaveDraft={handleSaveDraft}
        onSaveAndNext={handleSaveAndNext}
      />
    </div>
  )
}
