"use client"

import { useRef, useState } from "react"
import { ImagePlus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Zona para elegir o arrastrar fotos. Con `preview` muestra la foto y el botón
 * para quitarla. `compact` = casilla chica para la galería.
 */
export function Dropzone({
  preview,
  onFiles,
  onRemove,
  multiple,
  disabled,
  label = "Subí una foto",
  hint = "Arrastrala o hacé clic. JPG, PNG o WebP.",
  compact,
  className,
  alt = "Foto",
}: {
  preview?: string | null
  onFiles: (files: File[]) => void
  onRemove?: () => void
  multiple?: boolean
  disabled?: boolean
  label?: string
  hint?: string
  compact?: boolean
  className?: string
  alt?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  function elegir(lista: FileList | null) {
    const files = Array.from(lista ?? []).filter((f) => f.type.startsWith("image/"))
    if (files.length) onFiles(multiple ? files : files.slice(0, 1))
  }

  if (preview) {
    return (
      <div className={cn("group relative aspect-square overflow-hidden rounded-[12px] border border-linea bg-fondo-alterno", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt={alt} className="h-full w-full object-cover" />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className={cn(
              "absolute top-2 right-2 flex items-center justify-center rounded-[8px] bg-white/95 text-tinta shadow-sm transition-opacity hover:bg-error-fondo hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
              compact ? "size-7" : "size-8"
            )}
            aria-label="Quitar foto"
          >
            <Trash2 className="size-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          if (!disabled) elegir(e.dataTransfer.files)
        }}
        className={cn(
          "flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed px-3 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          over ? "border-primario bg-accent" : "border-linea bg-fondo-alterno/50 hover:border-texto-secundario/40 hover:bg-fondo-alterno",
          className
        )}
      >
        <ImagePlus className={cn("text-texto-secundario", compact ? "size-5" : "size-7")} strokeWidth={1.5} />
        {!compact && (
          <>
            <span className="text-sm font-semibold text-tinta">{label}</span>
            <span className="text-xs text-texto-secundario">{hint}</span>
          </>
        )}
        {compact && <span className="sr-only">{label}</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          elegir(e.target.files)
          e.target.value = ""
        }}
      />
    </>
  )
}
