import { cn } from "@/lib/utils"

type Tono = "exito" | "neutro" | "aviso" | "error" | "info"

const TONOS: Record<Tono, string> = {
  exito: "bg-exito-fondo text-[#1e6e49]",
  neutro: "bg-fondo-alterno text-texto-secundario",
  aviso: "bg-aviso-fondo text-tinta",
  error: "bg-error-fondo text-[#a82727]",
  info: "bg-accent text-primario",
}

const PUNTOS: Record<Tono, string> = {
  exito: "bg-exito",
  neutro: "bg-texto-secundario/50",
  aviso: "bg-aviso",
  error: "bg-error",
  info: "bg-primario",
}

/** Etiqueta de estado (activo, inactivo, destacado…). Píldora con punto de color. */
export function StatusBadge({
  tone = "neutro",
  children,
  className,
}: {
  tone?: Tono
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap",
        TONOS[tone],
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", PUNTOS[tone])} aria-hidden />
      {children}
    </span>
  )
}
