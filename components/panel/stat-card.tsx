import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/** Métrica del inicio: número grande en Bricolage, etiqueta y acento de color arriba. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primario",
  href,
}: {
  label: string
  value: number | string
  hint?: string
  icon: LucideIcon
  accent?: "primario" | "verde" | "amarillo" | "fucsia"
  href?: string
}) {
  const linea = {
    primario: "border-t-primario",
    verde: "border-t-nanduti-verde",
    amarillo: "border-t-nanduti-amarillo",
    fucsia: "border-t-nanduti-fucsia",
  }[accent]

  const contenido = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-texto-secundario">{label}</p>
        <Icon className="size-[18px] text-texto-secundario" strokeWidth={1.5} />
      </div>
      <p className="mt-2 font-titulos text-[34px] leading-none font-bold tracking-[-0.02em] text-tinta">{value}</p>
      {hint && <p className="mt-2 text-xs text-texto-secundario">{hint}</p>}
    </>
  )

  const clase = cn("block rounded-[16px] border border-linea border-t-4 bg-white p-5", linea)
  return href ? (
    <Link href={href} className={cn(clase, "transition-colors hover:bg-fondo-alterno/60")}>
      {contenido}
    </Link>
  ) : (
    <div className={clase}>{contenido}</div>
  )
}
