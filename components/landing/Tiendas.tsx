import Image from "next/image"
import type { Caso } from "@/config/casos"
import { PLATAFORMA } from "@/config/plataforma"
import { TrackedLink } from "@/components/landing/ui/TrackedLink"

export function Tiendas({ casos }: { casos: Caso[] }) {
  return (
    <section aria-labelledby="tiendas-t" className="border-y border-linea px-6 py-10">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-14 gap-y-6">
        <h2 id="tiendas-t" className="m-0 font-cuerpo text-[16px] font-medium leading-[1.4] text-texto-secundario">
          Ya venden con {PLATAFORMA.nombre}
        </h2>
        <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
          {casos.map((caso) => (
            <TrackedLink
              key={caso.id}
              href={caso.url || "#"}
              trackEvent="clic_caso"
              trackData={{ tienda: caso.id }}
              className="flex h-12 items-center gap-3 text-tinta hover:opacity-70"
            >
              {caso.logo ? (
                <Image
                  src={caso.logo}
                  alt={caso.nombre}
                  width={120}
                  height={40}
                  className="h-10 w-auto max-w-[120px] object-contain"
                />
              ) : (
                <span className="grid h-10 place-items-center rounded-[8px] border-[1.5px] border-dashed border-linea px-[14px] font-cuerpo text-[12px] font-medium leading-none text-texto-secundario">
                  logo
                </span>
              )}
              <span className="font-titulos text-[18px] font-semibold leading-none">{caso.nombre}</span>
            </TrackedLink>
          ))}
        </div>
      </div>
    </section>
  )
}
