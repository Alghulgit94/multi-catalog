"use client"

import { useState, DragEvent, ChangeEvent, useRef } from "react"
import { ImagePlus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { uploadProductImage } from "../../../productos/actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CoverUploadProps {
  coverPublicId: string | null
  coverPreview: string
  categorySlug: string
  productSlug: string
  onUpdate: (data: { coverPublicId: string; coverPreview: string }) => void
  onRemove: () => void
}

export function CoverUpload({ coverPublicId, coverPreview, productSlug, onUpdate, onRemove }: CoverUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setIsUploading(true)
    try {
      const result = await uploadProductImage(file, productSlug, "cover")
      if ("error" in result && result.error) {
        toast.error(result.error)
      } else if (result.success) {
        onUpdate({ coverPublicId: result.public_id, coverPreview: result.secure_url })
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="mb-8">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2">
        <h3 className="font-titulos text-[17px] font-semibold text-tinta">Portada</h3>
        <span className="text-xs text-texto-secundario">La primera foto que se ve. JPG, PNG o WebP.</span>
      </div>

      <div
        onDragOver={(e: DragEvent) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e: DragEvent) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(e: DragEvent) => {
          e.preventDefault()
          setIsDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file) uploadFile(file)
        }}
        className={cn(
          "relative aspect-[4/3] w-full max-w-[520px] overflow-hidden rounded-[16px] transition-colors",
          !coverPublicId && "border-2 border-dashed",
          isDragging ? "border-primario bg-accent" : !coverPublicId && "border-linea bg-fondo-alterno/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            e.target.value = ""
            if (file) uploadFile(file)
          }}
        />

        {isUploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
            <Loader2 className="size-8 animate-spin text-primario" />
          </div>
        )}

        {coverPublicId ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPreview} alt="Portada" className="h-full w-full border border-linea object-cover" />
            <div className="absolute right-3 bottom-3 flex gap-2">
              <Button size="sm" variant="outline" className="bg-white" onClick={() => inputRef.current?.click()}>
                Cambiar
              </Button>
              <Button size="sm" variant="outline" className="bg-white text-destructive hover:bg-error-fondo" onClick={onRemove}>
                Quitar
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-3 hover:bg-fondo-alterno"
          >
            <ImagePlus className={cn("size-10", isDragging ? "text-primario" : "text-texto-secundario")} strokeWidth={1.5} />
            <span>
              <span className="block text-sm font-semibold text-tinta">
                {isDragging ? "Soltá la foto acá" : "Arrastrá una foto acá"}
              </span>
              <span className="mt-1 block text-xs text-texto-secundario">O hacé clic para elegirla</span>
            </span>
          </button>
        )}
      </div>
    </section>
  )
}
