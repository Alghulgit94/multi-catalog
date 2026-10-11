import { MessageCircle, Search } from "lucide-react"
import { MarcoCelular } from "@/components/landing/ui/MarcoCelular"

/** Cuántos dígitos del número local se muestran con formato: 981 123 456. */
function formatearLocal(whatsapp: string) {
  const local = whatsapp.replace(/^595/, "")
  return `+595 ${local.replace(/(\d{3})(?=\d)/g, "$1 ").trim()}`
}

/**
 * Vista previa del catálogo del visitante. Se arma a medida que completa los
 * pasos: nombre o logo arriba, y el botón de consulta por WhatsApp abajo.
 */
export function PhonePreview({
  nombre,
  logoUrl,
  whatsapp,
}: {
  nombre: string
  logoUrl: string | null
  whatsapp: string
}) {
  const titulo = nombre.trim() || "Tu negocio"

  return (
    <MarcoCelular width={290} height={560}>
      <div className="relative flex h-full flex-col bg-white font-cuerpo">
        <div className="flex h-14 flex-none items-center justify-between border-b border-linea px-4">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={logoUrl} src={logoUrl} alt={`Logo de ${titulo}`} className="ob-fade max-h-8 max-w-[150px] object-contain" />
          ) : (
            <span key={titulo} className="ob-fade truncate font-titulos text-[18px] font-bold text-tinta">
              {titulo}
            </span>
          )}
          <Search size={18} strokeWidth={1.75} className="flex-none text-texto-secundario" aria-hidden="true" />
        </div>

        <div className="flex flex-none gap-2 overflow-hidden px-4 py-3">
          {["Todos", "Novedades", "Ofertas"].map((chip, i) => (
            <span
              key={chip}
              className={
                i === 0
                  ? "rounded-full border border-tinta px-3 py-1 text-[11px] font-medium text-tinta"
                  : "rounded-full border border-linea px-3 py-1 text-[11px] text-texto-secundario"
              }
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-hidden px-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="aspect-square rounded-foto bg-fondo-alterno" />
              <div className="mt-2 h-2 w-4/5 rounded bg-fondo-alterno" />
              <div className="mt-1.5 h-2 w-2/5 rounded bg-fondo-alterno" />
            </div>
          ))}
        </div>

        <div className="flex-none p-4">
          <div
            className={
              whatsapp
                ? "flex h-11 items-center justify-center gap-2 rounded-boton bg-whatsapp text-[13px] font-semibold text-tinta"
                : "flex h-11 items-center justify-center gap-2 rounded-boton border border-dashed border-linea text-[12px] text-texto-secundario"
            }
          >
            <MessageCircle size={16} strokeWidth={1.75} aria-hidden="true" />
            {whatsapp ? (
              <span key={whatsapp} className="ob-fade">
                Consultar · {formatearLocal(whatsapp)}
              </span>
            ) : (
              <span>Tu botón de WhatsApp</span>
            )}
          </div>
        </div>
      </div>
    </MarcoCelular>
  )
}
