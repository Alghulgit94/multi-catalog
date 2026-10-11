import Image from "next/image"
import { PLATAFORMA } from "@/config/plataforma"
import { IMG } from "@/config/imagenes-landing"

const FOTOS_SUELTAS = [IMG.espejoMimbre, IMG.espejo, IMG.espejoLuz]

const BURBUJA_RECIBIDA =
  "self-start rounded-[14px_14px_14px_4px] bg-fondo-alterno px-[14px] py-[10px] font-cuerpo text-[15px] leading-[1.4]"

export function Problema() {
  return (
    <section aria-labelledby="problema-t" className="katalo-seccion">
      <div className="mx-auto max-w-[1200px]">
        <div className="max-w-[680px]">
          <h2
            id="problema-t"
            className="m-0 text-balance font-titulos text-[clamp(30px,3.6vw,40px)] font-bold leading-[1.1] tracking-[-0.02em]"
          >
            Dejá de mandar fotos una por una.
          </h2>
          <p className="m-0 mt-5 text-pretty font-cuerpo text-[clamp(16px,1.5vw,18px)] leading-[1.6] text-texto-secundario">
            Cada cliente pregunta lo mismo: qué tenés, cuánto sale, si hay en otro color. Con tu catálogo, ve todo en un
            lugar y te escribe cuando ya eligió.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-0">
          <div className="border-t-[1.5px] border-linea py-8 pr-[clamp(0px,4vw,56px)]">
            <h3 className="m-0 mb-6 font-titulos text-[clamp(20px,2vw,24px)] font-semibold leading-[1.2] text-texto-secundario">
              Hoy
            </h3>
            <div className="flex max-w-[360px] flex-col gap-2">
              <span className={BURBUJA_RECIBIDA}>¿Qué tenés en espejos?</span>
              <div className="flex gap-[6px] self-end">
                {FOTOS_SUELTAS.map((f) => (
                  <Image
                    key={f.src}
                    src={f.src}
                    alt={f.alt}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-[8px] bg-fondo-alterno object-cover"
                  />
                ))}
              </div>
              <span className={BURBUJA_RECIBIDA}>¿Cuánto sale el segundo?</span>
              <span className="self-end rounded-[14px_14px_4px_14px] bg-linea px-[14px] py-[10px] font-cuerpo text-[15px] leading-[1.4]">
                Gs. 300.000
              </span>
              <span className={BURBUJA_RECIBIDA}>¿Y hay en otro tamaño?</span>
            </div>
          </div>

          <div className="border-t-4 border-primario py-8">
            <h3 className="m-0 mb-6 font-titulos text-[clamp(20px,2vw,24px)] font-semibold leading-[1.2] text-tinta">
              Con tu catálogo
            </h3>
            <div className="flex max-w-[400px] flex-col gap-4">
              <span className="self-end rounded-[14px_14px_4px_14px] bg-tinta px-4 py-3 font-cuerpo text-[15px] font-medium leading-[1.4] text-white">
                Mirá todo acá:{" "}
                <span className="underline underline-offset-[3px]">{PLATAFORMA.dominio}/ug-hogar</span>
              </span>
              <p className="m-0 font-cuerpo text-[16px] leading-[1.6] text-texto-secundario">
                Un mensaje. Tu cliente recorre fotos, precios y categorías solo, y te escribe cuando ya sabe qué quiere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
