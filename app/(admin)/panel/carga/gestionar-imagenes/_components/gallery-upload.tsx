"use client"

import { useState, ChangeEvent, useRef } from "react"
import { uploadProductImage } from "../../../productos/actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { MAX_GALLERY_IMAGES as MAX_GALLERY } from "@/lib/types-catalog"

interface GalleryItem {
  publicId: string
  preview: string
  label: string
}

interface GalleryUploadProps {
  galleryItems: GalleryItem[]
  categorySlug: string
  productSlug: string
  onUpdate: (items: GalleryItem[]) => void
}

export function GalleryUpload({
  galleryItems,
  categorySlug,
  productSlug,
  onUpdate,
}: GalleryUploadProps) {
  const [uploadingCount, setUploadingCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleAddClick() {
    if (galleryItems.length + uploadingCount < MAX_GALLERY) {
      inputRef.current?.click()
    }
  }

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0) return

    const availableSlots = MAX_GALLERY - galleryItems.length
    const toUpload = files.slice(0, availableSlots)
    if (files.length > toUpload.length) {
      toast.error(`Solo se pueden agregar ${toUpload.length} imágenes más (máximo ${MAX_GALLERY})`)
    }
    if (toUpload.length === 0) return

    const baseIndex = galleryItems.length      // 0-based: server adds 1 and pads
    setUploadingCount(toUpload.length)
    try {
      const results = await Promise.all(
        toUpload.map((file, offset) =>
          uploadProductImage(file, productSlug, "gallery", baseIndex + offset)
        )
      )
      const newItems: GalleryItem[] = []
      results.forEach((result, offset) => {
        if ("error" in result) {
          toast.error(result.error)
          return
        }
        const padded = String(baseIndex + offset + 1).padStart(2, "0")
        newItems.push({
          publicId: result.public_id,
          preview: result.secure_url,
          label: `Imagen ${padded}`,
        })
      })
      if (newItems.length > 0) {
        onUpdate([...galleryItems, ...newItems])
        toast.success(
          newItems.length > 1
            ? `${newItems.length} imágenes agregadas a la galería`
            : "Imagen agregada a la galería"
        )
      }
    } finally {
      setUploadingCount(0)
    }
  }

  function handleRemove(index: number) {
    const updated = galleryItems.filter((_, i) => i !== index)
    onUpdate(updated)
  }

  const isFull = galleryItems.length + uploadingCount >= MAX_GALLERY

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-[20px]">grid_view</span>
        <h3 className="text-sm font-semibold text-foreground">Galería de Imágenes</h3>
        <span className="text-xs text-muted-foreground ml-1">
          {galleryItems.length} de {MAX_GALLERY} espacios utilizados
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      <div className="grid grid-cols-4 gap-4">
        {/* Filled slots */}
        {galleryItems.map((item, i) => (
          <div
            key={item.publicId}
            className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
          >
            <img
              src={item.preview}
              alt={item.label}
              className="w-full h-full object-cover"
            />
            {/* Label overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-[10px] text-white font-medium">{item.label}</p>
            </div>
            {/* Remove button */}
            <button
              onClick={() => handleRemove(i)}
              className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-red-600 p-0.5"
            >
              <span className="material-symbols-outlined text-white text-[14px]">close</span>
            </button>
          </div>
        ))}

        {/* Uploading placeholders */}
        {Array.from({ length: uploadingCount }).map((_, i) => (
          <div key={`uploading-${i}`} className="aspect-square rounded-xl bg-muted flex items-center justify-center">
            <span className="material-symbols-outlined text-muted-foreground text-[32px] animate-spin">sync</span>
          </div>
        ))}

        {/* Add slot */}
        {!isFull && uploadingCount === 0 && (
          <button
            onClick={handleAddClick}
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed border-border bg-muted/20",
              "flex flex-col items-center justify-center gap-1 text-muted-foreground",
              "hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
            )}
          >
            <span className="material-symbols-outlined text-[28px]">add</span>
            <span className="text-[10px] font-medium">Agregar</span>
          </button>
        )}
      </div>
    </div>
  )
}
