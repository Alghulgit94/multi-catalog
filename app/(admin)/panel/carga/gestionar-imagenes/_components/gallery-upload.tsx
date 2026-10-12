"use client"

import { useState, ChangeEvent, useRef } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { subirFoto } from "@/lib/upload-client"
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

export function GalleryUpload({ galleryItems, productSlug, onUpdate }: GalleryUploadProps) {
  const [uploadingCount, setUploadingCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0) return

    const availableSlots = MAX_GALLERY - galleryItems.length
    const toUpload = files.slice(0, availableSlots)
    if (files.length > toUpload.length) {
      toast.error(`Se agregan ${toUpload.length} fotos: la galería admite hasta ${MAX_GALLERY}.`)
    }
    if (toUpload.length === 0) return

    const baseIndex = galleryItems.length // 0-based: server adds 1 and pads
    setUploadingCount(toUpload.length)
    try {
      // De a una: con conexión lenta rinde más y no compiten entre sí.
      const results = []
      for (const [offset, file] of toUpload.entries()) {
        results.push(await subirFoto({ file, tipo: "producto-galeria", slug: productSlug, indice: baseIndex + offset }))
      }
      const newItems: GalleryItem[] = []
      results.forEach((result, offset) => {
        if (!result.success) {
          toast.error(result.error)
          return
        }
        newItems.push({
          publicId: result.public_id,
          preview: result.secure_url,
          label: `Foto ${baseIndex + offset + 1}`,
        })
      })
      if (newItems.length > 0) onUpdate([...galleryItems, ...newItems])
    } finally {
      setUploadingCount(0)
    }
  }

  const isFull = galleryItems.length + uploadingCount >= MAX_GALLERY

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2">
        <h3 className="font-titulos text-[17px] font-semibold text-tinta">Galería</h3>
        <span className="text-xs text-texto-secundario">
          {galleryItems.length} de {MAX_GALLERY} fotos
        </span>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />

      <div className="grid max-w-[640px] grid-cols-2 gap-3 sm:grid-cols-4">
        {galleryItems.map((item, i) => (
          <div key={item.publicId} className="group relative aspect-square overflow-hidden rounded-[12px] border border-linea bg-fondo-alterno">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.preview} alt={item.label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onUpdate(galleryItems.filter((_, j) => j !== i))}
              className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-[8px] bg-white/95 text-tinta shadow-sm transition-opacity hover:bg-error-fondo hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
              aria-label={`Quitar ${item.label}`}
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        ))}

        {Array.from({ length: uploadingCount }).map((_, i) => (
          <div key={`uploading-${i}`} className="flex aspect-square items-center justify-center rounded-[12px] bg-fondo-alterno">
            <Loader2 className="size-6 animate-spin text-primario" />
          </div>
        ))}

        {!isFull && uploadingCount === 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[12px] border-2 border-dashed border-linea bg-fondo-alterno/50 text-texto-secundario transition-colors hover:border-primario hover:bg-accent hover:text-primario"
          >
            <Plus className="size-6" strokeWidth={1.5} />
            <span className="text-xs font-semibold">Agregar</span>
          </button>
        )}
      </div>
    </section>
  )
}
