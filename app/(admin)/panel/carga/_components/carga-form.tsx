"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field } from "@/components/panel/form-section"
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
    <div className="flex flex-col gap-5">
      <Field label="Período" htmlFor="periodo">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger id="periodo" className="w-full">
            <SelectValue placeholder="Elegí el período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mar2026">Marzo 2026</SelectItem>
            <SelectItem value="abr2026">Abril 2026</SelectItem>
            <SelectItem value="may2026">Mayo 2026</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Archivo">
        <UploadZone onFileChange={setFile} />
      </Field>

      <Button size="lg" className="w-full" onClick={handleProcesar} disabled={!file}>
        <Upload /> Procesar planilla
      </Button>
    </div>
  )
}
