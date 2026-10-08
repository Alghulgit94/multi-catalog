"use client"

import { useState, DragEvent, ChangeEvent, useRef } from "react"
import { uploadProductImage } from "../../../productos/actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CoverUploadProps {
  coverPublicId: string | null
  coverPreview: string
  categorySlug: string
  productSlug: string
  onUpdate: (data: { coverPublicId: string; coverPreview: string }) => void
  onRemove: () => void
}

export function CoverUpload({
  coverPublicId,
  coverPreview,
  categorySlug,
  productSlug,
  onUpdate,
  onRemove,
}: CoverUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setIsUploading(true)
    try {
      const result = await uploadProductImage(file, productSlug, "cover")
      if ("error" in result) {
        toast.error(result.error)
      } else {
        onUpdate({ coverPublicId: result.public_id, coverPreview: result.secure_url })
        toast.success("Portada actualizada")
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-[20px]">star</span>
        <h3 className="text-sm font-semibold text-foreground">Imagen de Portada</h3>
        <span className="text-xs text-muted-foreground ml-1">JPG, PNG, WebP — 16:7 recomendado</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative w-full aspect-[16/7] rounded-2xl overflow-hidden transition-all",
          !coverPublicId && "border-2 border-dashed",
          isDragging
            ? "border-primary/50 bg-primary/5"
            : !coverPublicId
            ? "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
            : ""
        )}
        onClick={!coverPublicId ? () => inputRef.current?.click() : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {isUploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-2xl">
            <span className="material-symbols-outlined text-white text-[40px] animate-spin">sync</span>
          </div>
        )}

        {coverPublicId ? (
          <>
            <img
              src={coverPreview}
              alt="Portada"
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 hover:bg-black/40 transition-all group">
              <button
                onClick={() => inputRef.current?.click()}
                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-foreground hover:bg-white/90"
              >
                Cambiar
              </button>
              <button
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <span className={cn(
              "material-symbols-outlined text-[48px] transition-all",
              isDragging ? "text-primary scale-110" : "text-muted-foreground/50"
            )}>
              add_photo_alternate
            </span>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Suelta la imagen aquí" : "Arrastra una imagen aquí"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">O haz clic para seleccionar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
