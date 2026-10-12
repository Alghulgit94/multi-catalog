import { ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Tabla simple del panel (listados de productos, categorías, subcategorías).
 * Encabezado gris, filas con hover, sin sombras. Con `toolbar` arriba
 * (búsqueda y filtros) dentro de la misma hoja, como Shopify.
 */
export function DataTable({
  toolbar,
  children,
  className,
}: {
  toolbar?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-[16px] border border-linea bg-white", className)}>
      {toolbar && <div className="flex flex-wrap items-center gap-2 border-b border-linea p-3">{toolbar}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  )
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "bg-fondo-alterno px-4 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-texto-secundario",
        className
      )}
    >
      {children}
    </th>
  )
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn("border-t border-linea transition-colors first:border-t-0 hover:bg-fondo-alterno/60", className)}>
      {children}
    </tr>
  )
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-tinta", className)}>{children}</td>
}

/** Miniatura cuadrada para filas de tabla (o placeholder sin foto). */
export function Thumb({ src, alt, size = 40 }: { src?: string | null; alt: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-linea bg-fondo-alterno"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <ImageOff className="size-4 text-texto-secundario/60" strokeWidth={1.5} aria-label="Sin foto" />
      )}
    </div>
  )
}
