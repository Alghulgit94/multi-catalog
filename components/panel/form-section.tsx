import { cn } from "@/lib/utils"

/**
 * Bloque de formulario: título + contenido en una hoja con borde (como los
 * formularios de Shopify). `aside` lo hace más compacto para la columna derecha.
 */
export function FormSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-[16px] border border-linea bg-white p-5 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-titulos text-[17px] font-semibold text-tinta">{title}</h2>}
            {description && <p className="mt-1 text-sm text-texto-secundario">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

/** Campo: label + control + ayuda. */
export function Field({
  label,
  htmlFor,
  hint,
  optional,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: React.ReactNode
  optional?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-tinta">
        {label}
        {optional && <span className="ml-1 font-normal text-texto-secundario">(opcional)</span>}
      </label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-texto-secundario">{hint}</p>}
    </div>
  )
}

/** Casilla con texto, nativa (funciona con FormData) y con estilo de marca. */
export function CheckField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string
  label: string
  description?: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 select-none">
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-[18px] shrink-0 cursor-pointer rounded-[5px] accent-primario"
      />
      <span>
        <span className="block text-sm font-medium text-tinta">{label}</span>
        {description && <span className="block text-xs text-texto-secundario">{description}</span>}
      </span>
    </label>
  )
}
