import { PLATAFORMA } from "@/config/plataforma"
import { Boton } from "@/components/landing/ui/Boton"
import { Nanduti } from "@/components/landing/ui/Nanduti"

export function Cierre() {
  return (
    <section
      aria-labelledby="cierre-t"
      className="relative overflow-hidden px-6 py-[clamp(88px,12vw,144px)] text-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 opacity-40 md:h-[600px] md:w-[600px]"
      >
        <Nanduti variante="cierre" className="h-full w-full" />
      </div>

      <div className="relative mx-auto flex max-w-[720px] flex-col items-center bg-[radial-gradient(closest-side,#FFFFFF_62%,rgba(255,255,255,0))] px-6 py-12">
        <h2
          id="cierre-t"
          className="m-0 text-balance font-titulos text-[clamp(36px,4.6vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]"
        >
          Tu catálogo puede estar listo hoy.
        </h2>
        <Boton
          href={PLATAFORMA.rutas.registro}
          fullWidthMobile
          className="mt-10 px-7"
          trackEvent="clic_crear_catalogo"
          trackData={{ seccion: "cierre" }}
        >
          Crear mi catálogo gratis
        </Boton>
        <span className="mt-3 font-cuerpo text-[14px] leading-[1.4] text-texto-secundario">
          Gratis hasta 10 productos. Sin tarjeta.
        </span>
      </div>
    </section>
  )
}
