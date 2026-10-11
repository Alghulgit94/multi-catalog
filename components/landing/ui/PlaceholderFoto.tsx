import { cn } from "@/lib/utils"

/**
 * Marcador visual para contenido pendiente (fotos, logos, testimonios) que
 * todavía no existe. Nunca se reemplaza por contenido inventado — ver
 * docs/katalo-brand.md, sección "Pendientes".
 */
export function PlaceholderFoto({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-foto border-[1.5px] border-dashed border-linea bg-white p-2 text-center font-cuerpo text-[11px] font-medium leading-[1.3] text-texto-secundario",
        className,
      )}
    >
      {label}
    </div>
  )
}
