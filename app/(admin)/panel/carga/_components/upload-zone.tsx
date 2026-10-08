"use client"

import { useState, DragEvent, ChangeEvent } from "react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFileChange?: (file: File) => void
}

export function UploadZone({ onFileChange }: UploadZoneProps = {}) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileChange?.(file)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileChange?.(file)
    }
  }

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all",
        isDragging
          ? "border-primary/50 bg-primary/5"
          : "border-secondary/30 bg-secondary/5 hover:border-primary/30 hover:bg-primary/5"
      )}
    >
      <input
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={handleChange}
      />
      <span
        className={cn(
          "material-symbols-outlined text-[48px] transition-transform",
          isDragging ? "text-primary scale-110" : "text-secondary/60"
        )}
      >
        upload_file
      </span>
      {fileName ? (
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground mt-1">Haz clic para cambiar el archivo</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {isDragging ? "Suelta el archivo aquí" : "Arrastra tu archivo aquí"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            O haz clic para seleccionar — .xlsx o .csv
          </p>
        </div>
      )}
    </label>
  )
}
