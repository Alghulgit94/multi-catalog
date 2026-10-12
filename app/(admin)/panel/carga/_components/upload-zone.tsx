"use client"

import { useState, DragEvent, ChangeEvent } from "react"
import { FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFileChange?: (file: File) => void
}

export function UploadZone({ onFileChange }: UploadZoneProps = {}) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const elegir = (file?: File) => {
    if (!file) return
    setFileName(file.name)
    onFileChange?.(file)
  }

  return (
    <label
      onDragOver={(e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        setIsDragging(false)
      }}
      onDrop={(e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        setIsDragging(false)
        elegir(e.dataTransfer.files?.[0])
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[12px] border-2 border-dashed p-10 text-center transition-colors",
        isDragging ? "border-primario bg-accent" : "border-linea bg-fondo-alterno/50 hover:border-texto-secundario/40 hover:bg-fondo-alterno"
      )}
    >
      <input
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => elegir(e.target.files?.[0])}
      />
      <FileSpreadsheet className={cn("size-10", isDragging ? "text-primario" : "text-texto-secundario")} strokeWidth={1.5} />
      {fileName ? (
        <div>
          <p className="text-sm font-semibold text-tinta">{fileName}</p>
          <p className="mt-1 text-xs text-texto-secundario">Hacé clic para cambiar el archivo</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-tinta">{isDragging ? "Soltá el archivo acá" : "Arrastrá tu planilla acá"}</p>
          <p className="mt-1 text-xs text-texto-secundario">O hacé clic para elegirla. Formato .xlsx o .csv</p>
        </div>
      )}
    </label>
  )
}
