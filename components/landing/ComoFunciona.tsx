import { PLATAFORMA } from "@/config/plataforma"
import { Boton } from "@/components/landing/ui/Boton"

const PASOS = [
  {
    numero: "01",
    titulo: "Creá tu cuenta en un minuto.",
    texto: "Con tu correo y el nombre de tu negocio.",
    hilo: "border-nanduti-fucsia",
  },
  {
    numero: "02",
    titulo: "Cargá tus productos con fotos, precios y categorías.",
    texto: "Desde el celular, sacando la foto en el momento.",
    hilo: "border-nanduti-amarillo",
  },
  {
    numero: "03",
    titulo: "Compartí tu link en WhatsApp, Instagram o donde vendas.",
    texto: "En tu estado, tu bio o directo al cliente.",
    hilo: "border-nanduti-verde",
  },
]

export function ComoFunciona() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-t"
      className="katalo-seccion scroll-mt-[72px] bg-fondo-alterno"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          id="como-t"
          className="m-0 font-titulos text-[clamp(30px,3.6vw,40px)] font-bold leading-[1.1] tracking-[-0.02em]"
        >
          Así de simple.
        </h2>

        <ol className="m-0 mt-14 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-12 gap-y-10 p-0">
          {PASOS.map((paso) => (
            <li key={paso.numero} className={`border-t-4 pt-6 ${paso.hilo}`}>
              <span className="block font-titulos text-[56px] font-bold leading-none tracking-[-0.03em] text-primario">
                {paso.numero}
              </span>
              <h3 className="m-0 mb-2 mt-6 font-titulos text-[clamp(20px,2vw,24px)] font-semibold leading-[1.25]">
                {paso.titulo}
              </h3>
              <p className="m-0 font-cuerpo text-[16px] leading-[1.6] text-texto-secundario">{paso.texto}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex">
          <Boton
            href={PLATAFORMA.rutas.registro}
            fullWidthMobile
            className="px-7"
            trackEvent="clic_crear_catalogo"
            trackData={{ seccion: "como_funciona" }}
          >
            Empezar ahora
          </Boton>
        </div>
      </div>
    </section>
  )
}
