"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UploadZone } from "./upload-zone"

export function CargaForm() {
  const router = useRouter()
  const [periodo, setPeriodo] = useState("")
  const [file, setFile] = useState<File | null>(null)

  function handleProcesar() {
    // Store a sentinel so gestionar-imagenes knows to show all products
    sessionStorage.setItem("carga_product_ids", "ALL")
    sessionStorage.setItem("carga_periodo", periodo)
    router.push("/panel/carga/gestionar-imagenes")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Period selector */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Período</label>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mar2026">Marzo 2026</SelectItem>
            <SelectItem value="abr2026">Abril 2026</SelectItem>
            <SelectItem value="may2026">Mayo 2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upload zone */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Archivo</label>
        <UploadZone onFileChange={setFile} />
      </div>

      <Button
        size="lg"
        className="w-full mt-2"
        onClick={handleProcesar}
        disabled={!file}
      >
        <span className="material-symbols-outlined text-[18px] mr-2">upload_file</span>
        Procesar Catálogo
      </Button>
    </div>
  )
}
