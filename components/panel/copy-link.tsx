"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

/** Muestra el link del catálogo y lo copia al portapapeles. */
export function CopyLink({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      toast.success("Link copiado")
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error("No pudimos copiar el link. Copialo a mano.")
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-[12px] border border-linea bg-fondo-alterno/60 p-1.5 pl-3">
      <span className="min-w-0 flex-1 truncate text-sm text-tinta">{url.replace(/^https?:\/\//, "")}</span>
      <Button type="button" size="sm" variant={copiado ? "secondary" : "default"} onClick={copiar}>
        {copiado ? <Check /> : <Copy />}
        {copiado ? "Copiado" : "Copiar"}
      </Button>
    </div>
  )
}
