import Image from "next/image"
import { cn } from "@/lib/utils"

type NandutiVariante = "completo" | "cierre"

const ARCHIVOS: Record<NandutiVariante, string> = {
  completo: "/brand/motivo/nanduti-completo.svg",
  cierre: "/brand/motivo/nanduti-cierre.svg",
}

// El contenedor define el tamaño (el HTML de referencia usa un div de 640/460 con el SVG al 100%).
export function Nanduti({ variante, className }: { variante: NandutiVariante; className?: string }) {
  return (
    <Image
      src={ARCHIVOS[variante]}
      alt=""
      aria-hidden="true"
      width={400}
      height={400}
      className={cn("pointer-events-none block select-none", className)}
    />
  )
}
