import Image from "next/image"
import type { Caso } from "@/config/casos"
import { Boton } from "@/components/landing/ui/Boton"
import { PlaceholderFoto } from "@/components/landing/ui/PlaceholderFoto"

// El HTML de referencia cicla el hilo de color por posición: fucsia, verde, amarillo, primario.
const ACENTOS = ["var(--nanduti-fucsia)", "var(--nanduti-verde)", "var(--nanduti-amarillo)", "var(--primario)"]

function CasoCard({ caso, acento }: { caso: Caso; acento: string }) {
  const pendientes = Math.max(0, 6 - caso.fotos.length)

  return (
    <article className="flex flex-col gap-6 border-t-4 pt-8" style={{ borderTopColor: acento }}>
      <div className="grid grid-cols-3 gap-2">
        {caso.fotos.map((foto) => (
          <Image
            key={foto.src}
            src={foto.src}
            alt={foto.alt}
            width={200}
            height={200}
            className="block aspect-square h-auto w-full rounded-[8px] bg-linea object-cover"
          />
        ))}
        {Array.from({ length: pendientes }, (_, i) => (
          <PlaceholderFoto key={`slot-${i}`} label="Foto de producto" className="aspect-square" />
        ))}
      </div>

      <div className="flex items-center gap-[14px]">
        {caso.logo ? (
          <Image
            src={caso.logo}
            alt={`Logo de ${caso.nombre}`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-[8px] border border-linea bg-white object-contain"
          />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-[8px] border-[1.5px] border-dashed border-linea bg-white font-cuerpo text-[10px] font-medium leading-none text-texto-secundario">
            logo
          </span>
        )}
        <div>
          <h3 className="m-0 font-titulos text-[clamp(20px,2vw,24px)] font-semibold leading-[1.2]">{caso.nombre}</h3>
          <div className="font-cuerpo text-[14px] leading-[1.4] text-texto-secundario">{caso.rubro}</div>
        </div>
      </div>

      {caso.testimonio ? (
        <blockquote className="m-0 p-0 font-cuerpo text-[18px] font-medium leading-[1.55] text-tinta">
          <p className="m-0">{caso.testimonio.texto}</p>
          <footer className="mt-3 text-[14px] font-normal leading-[1.4] text-texto-secundario">
            {caso.testimonio.autor}
          </footer>
        </blockquote>
      ) : (
        <div className="rounded-[8px] border-[1.5px] border-dashed border-linea bg-white p-4 font-cuerpo text-[14px] leading-[1.5] text-texto-secundario">
          Testimonio del dueño, con nombre y foto — se muestra solo cuando esté escrito y aprobado por él.
        </div>
      )}

      <div>
        <Boton
          href={caso.url || "#"}
          targetBlank
          variante="secundario"
          fullWidthMobile
          trackEvent="clic_caso"
          trackData={{ tienda: caso.id }}
        >
          Ver su catálogo
        </Boton>
      </div>
    </article>
  )
}

export function Casos({ casos }: { casos: Caso[] }) {
  return (
    <section aria-labelledby="casos-t" className="katalo-seccion bg-fondo-alterno">
      <div className="mx-auto max-w-[1200px]">
        <h2
          id="casos-t"
          className="m-0 font-titulos text-[clamp(30px,3.6vw,40px)] font-bold leading-[1.1] tracking-[-0.02em]"
        >
          Comercios que ya venden así.
        </h2>
        <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-x-12 gap-y-16">
          {casos.map((caso, i) => (
            <CasoCard key={caso.id} caso={caso} acento={ACENTOS[i % ACENTOS.length]} />
          ))}
        </div>
      </div>
    </section>
  )
}
