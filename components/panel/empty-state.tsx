import { cn } from "@/lib/utils"

export type Ilustracion = "productos" | "categorias" | "busqueda" | "fotos" | "admin"

/**
 * Estado vacío: ilustración simple en colores del ñandutí, título, texto y CTA.
 * Va dentro de una hoja con borde (como los vacíos de Shopify).
 */
export function EmptyState({
  title,
  description,
  illustration = "productos",
  actions,
  className,
  bordered = true,
}: {
  title: string
  description?: React.ReactNode
  illustration?: Ilustracion
  actions?: React.ReactNode
  className?: string
  bordered?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-14 text-center",
        bordered && "rounded-[16px] border border-linea",
        className
      )}
    >
      <IlustracionVacia tipo={illustration} />
      <h2 className="mt-6 font-titulos text-xl font-semibold tracking-[-0.01em] text-tinta">{title}</h2>
      {description && <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-texto-secundario">{description}</p>}
      {actions && <div className="mt-6 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  )
}

/** Ilustraciones de línea, 120px, decorativas. Un acento por pieza, sobre un tinte. */
function IlustracionVacia({ tipo }: { tipo: Ilustracion }) {
  const comun = { width: 120, height: 120, viewBox: "0 0 120 120", fill: "none", "aria-hidden": true } as const
  const tinta = "#13203B"

  switch (tipo) {
    case "categorias":
      return (
        <svg {...comun}>
          <circle cx="60" cy="60" r="56" fill="#E2F2EA" />
          <rect x="30" y="34" width="34" height="24" rx="6" fill="#fff" stroke={tinta} strokeWidth="2" />
          <rect x="56" y="62" width="34" height="24" rx="6" fill="#fff" stroke={tinta} strokeWidth="2" />
          <path d="M47 58v14a4 4 0 0 0 4 4h5" stroke={tinta} strokeWidth="2" strokeLinecap="round" />
          <rect x="36" y="42" width="16" height="4" rx="2" fill="#2E9E6A" />
          <rect x="62" y="70" width="16" height="4" rx="2" fill="#2E9E6A" />
        </svg>
      )
    case "busqueda":
      return (
        <svg {...comun}>
          <circle cx="60" cy="60" r="56" fill="#F3F5F9" />
          <circle cx="54" cy="54" r="20" fill="#fff" stroke={tinta} strokeWidth="2.5" />
          <path d="m69 69 15 15" stroke={tinta} strokeWidth="3" strokeLinecap="round" />
          <path d="M46 54h16" stroke="#1F4FD8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case "fotos":
      return (
        <svg {...comun}>
          <circle cx="60" cy="60" r="56" fill="#FCE6EE" />
          <rect x="28" y="36" width="64" height="48" rx="8" fill="#fff" stroke={tinta} strokeWidth="2" />
          <circle cx="46" cy="52" r="6" fill="#E0457B" />
          <path d="m32 78 18-16 12 10 10-8 16 14" stroke={tinta} strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    case "admin":
      return (
        <svg {...comun}>
          <circle cx="60" cy="60" r="56" fill="#F3F5F9" />
          <rect x="32" y="30" width="56" height="62" rx="8" fill="#fff" stroke={tinta} strokeWidth="2" />
          <path d="M44 48h32M44 60h32M44 72h20" stroke={tinta} strokeWidth="2" strokeLinecap="round" />
          <circle cx="80" cy="80" r="12" fill="#1F4FD8" />
          <path d="m75 80 3.5 3.5L85 77" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg {...comun}>
          <circle cx="60" cy="60" r="56" fill="#FEF3D9" />
          <path d="M36 46 60 34l24 12v28L60 86 36 74V46Z" fill="#fff" stroke={tinta} strokeWidth="2" strokeLinejoin="round" />
          <path d="m36 46 24 12 24-12M60 58v28" stroke={tinta} strokeWidth="2" strokeLinejoin="round" />
          <path d="m48 40 24 12" stroke="#F5B82E" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
  }
}
