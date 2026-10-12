import Link from "next/link"
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Crumb {
  label: string
  href?: string
}

/**
 * Encabezado de cada pantalla del panel: título en Bricolage, descripción y
 * acciones a la derecha. Con `back` muestra la flecha para volver (formularios).
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  back,
  breadcrumb,
  actions,
  className,
}: {
  title: string
  description?: React.ReactNode
  icon?: LucideIcon
  /** Ruta de la flecha "volver". */
  back?: string
  breadcrumb?: Crumb[]
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {(back || breadcrumb) && (
          <div className="mb-3 flex items-center gap-2 text-sm text-texto-secundario">
            {back && (
              <Link
                href={back}
                className="flex size-8 items-center justify-center rounded-[10px] border border-linea bg-white text-tinta hover:bg-fondo-alterno"
                aria-label="Volver"
              >
                <ChevronLeft className="size-4" strokeWidth={1.75} />
              </Link>
            )}
            {breadcrumb && (
              <nav aria-label="Ubicación" className="flex min-w-0 items-center gap-1.5">
                {breadcrumb.map((c, i) => (
                  <span key={i} className="flex min-w-0 items-center gap-1.5">
                    {i > 0 && <ChevronRight className="size-3.5 shrink-0" strokeWidth={1.5} />}
                    {c.href ? (
                      <Link href={c.href} className="truncate hover:text-tinta">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="truncate text-tinta">{c.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="hidden size-10 shrink-0 items-center justify-center rounded-[12px] bg-fondo-alterno text-tinta sm:flex">
              <Icon className="size-5" strokeWidth={1.5} />
            </span>
          )}
          <h1 className="font-titulos text-[26px] leading-tight font-bold tracking-[-0.02em] text-tinta sm:text-[28px]">
            {title}
          </h1>
        </div>
        {description && <p className="mt-1.5 max-w-[65ch] text-[15px] text-texto-secundario">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

/** Contenedor de cada pantalla: márgenes y ancho máximo comunes. */
export function PageContainer({
  children,
  className,
  size = "wide",
}: {
  children: React.ReactNode
  className?: string
  size?: "wide" | "form"
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-8 sm:py-8",
        size === "form" ? "max-w-[1080px]" : "max-w-[1280px]",
        className
      )}
    >
      {children}
    </div>
  )
}
