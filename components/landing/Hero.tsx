import Image from "next/image"
import { PLATAFORMA } from "@/config/plataforma"
import { IMG } from "@/config/imagenes-landing"
import { CASOS } from "@/config/casos"
import { formatoGs } from "@/config/planes"
import { Boton } from "@/components/landing/ui/Boton"
import { MarcoCelular } from "@/components/landing/ui/MarcoCelular"
import { Nanduti } from "@/components/landing/ui/Nanduti"
import { BurbujaWhatsApp } from "@/components/landing/ui/BurbujaWhatsApp"

const PRODUCTOS_CATALOGO = [IMG.poltrona, IMG.espejoMimbre, IMG.lampara, IMG.cesta]
const CATEGORIAS = ["Todo", "Sofá", "Decoración", "Espejos"]
const LOGO_TIENDA = CASOS[0].logo

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-[clamp(72px,9vw,120px)] pt-[clamp(40px,7vw,96px)]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-[clamp(56px,6vw,80px)]">
        <div className="relative z-[2] max-w-[560px]">
          <h1 className="m-0 text-balance font-titulos text-[clamp(40px,5.4vw,64px)] font-bold leading-[1.05] tracking-[-0.025em] text-tinta">
            Tu catálogo en{" "}
            <span className="whitespace-nowrap underline decoration-nanduti-fucsia decoration-[5px] underline-offset-[10px] [text-decoration-skip-ink:none]">
              un link
            </span>
            . Tus ventas por WhatsApp.
          </h1>
          <p className="m-0 mt-6 max-w-[30em] text-pretty font-cuerpo text-[clamp(16px,1.5vw,18px)] leading-[1.6] text-texto-secundario">
            Cargá tus productos con fotos y precios, compartí un solo link y recibí las consultas en tu WhatsApp con el
            producto ya elegido.
          </p>
          <div className="mt-10 flex flex-col items-start gap-3 max-md:items-stretch">
            <Boton
              href={PLATAFORMA.rutas.registro}
              className="px-7"
              trackEvent="clic_crear_catalogo"
              trackData={{ seccion: "hero" }}
            >
              Crear mi catálogo gratis
            </Boton>
            <span className="font-cuerpo text-[14px] leading-[1.4] text-texto-secundario">
              Gratis hasta 10 productos. Sin tarjeta.
            </span>
          </div>
        </div>

        <div className="relative flex min-h-[600px] items-center justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 md:h-[640px] md:w-[640px]"
          >
            <Nanduti variante="completo" className="h-full w-full" />
          </div>

          <MarcoCelular className="z-[1]">
            <div className="flex h-full flex-col">
              <div className="flex h-7 items-center justify-between px-[18px] font-cuerpo text-[11px] font-semibold leading-none text-tinta">
                <span>9:41</span>
                <span className="h-4 w-14 rounded-[10px] bg-tinta" />
                <span>100%</span>
              </div>
              <div className="flex items-center gap-[10px] border-b border-linea px-[14px] pb-[10px] pt-2">
                {LOGO_TIENDA && (
                  <Image
                    src={LOGO_TIENDA}
                    alt="UG Hogar"
                    width={34}
                    height={34}
                    className="h-[34px] w-[34px] rounded-[8px] border border-linea bg-white object-contain"
                  />
                )}
                <div className="min-w-0">
                  <div className="font-titulos text-[14px] font-bold leading-[1.2] text-tinta">UG Hogar</div>
                  <div className="font-cuerpo text-[10px] leading-[1.3] text-texto-secundario">
                    {PLATAFORMA.dominio}/ug-hogar
                  </div>
                </div>
              </div>
              <div className="flex gap-[6px] overflow-hidden px-[14px] py-[10px]">
                {CATEGORIAS.map((cat, i) => (
                  <span
                    key={cat}
                    className={
                      i === 0
                        ? "flex-none rounded-full bg-tinta px-[10px] py-[5px] font-cuerpo text-[10px] font-semibold leading-none text-white"
                        : "flex-none rounded-full border border-linea px-[10px] py-[5px] font-cuerpo text-[10px] font-medium leading-none text-tinta"
                    }
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_1fr] gap-x-[10px] gap-y-3 px-[14px] pb-[14px] pt-[2px]">
                {PRODUCTOS_CATALOGO.map((p) => (
                  <div key={p.src}>
                    <Image
                      src={p.src}
                      alt={p.alt}
                      width={200}
                      height={200}
                      className="block aspect-square h-auto w-full rounded-[8px] bg-fondo-alterno object-cover"
                    />
                    <div className="mt-[6px] overflow-hidden text-ellipsis whitespace-nowrap font-cuerpo text-[11px] font-medium leading-[1.25] text-tinta">
                      {p.alt}
                    </div>
                    <div className="font-cuerpo text-[11px] font-bold leading-[1.4] text-tinta">
                      {formatoGs(p.precio)}
                    </div>
                    <div className="mt-[5px] grid h-[22px] place-items-center rounded-[6px] border border-tinta font-cuerpo text-[10px] font-semibold leading-none text-tinta">
                      Consultar
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MarcoCelular>

          <BurbujaWhatsApp
            producto={IMG.poltrona}
            mensaje={`Hola, me interesa la Poltrona de ${formatoGs(IMG.poltrona.precio)}. ¿Está disponible?`}
            hora="10:24"
            className="bottom-[72px] left-[calc(50%-170px)] md:left-[calc(50%-220px)] lg:left-[calc(50%-250px)]"
          />
        </div>
      </div>
    </section>
  )
}
