import Image from "next/image"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { PLATAFORMA } from "@/config/plataforma"
import { IMG } from "@/config/imagenes-landing"
import { formatoGs } from "@/config/planes"
import { Boton } from "@/components/landing/ui/Boton"
import { MarcoCelular } from "@/components/landing/ui/MarcoCelular"
import { PlaceholderFoto } from "@/components/landing/ui/PlaceholderFoto"

const H2 =
  "m-0 text-balance font-titulos text-[clamp(30px,3.6vw,40px)] font-bold leading-[1.1] tracking-[-0.02em]"
const P =
  "m-0 mt-5 text-pretty font-cuerpo text-[clamp(16px,1.5vw,18px)] leading-[1.6] text-texto-secundario"
const CHIP_ACTIVO =
  "rounded-full bg-tinta px-[10px] py-[5px] font-cuerpo text-[10px] font-semibold leading-none text-white"
const CHIP =
  "rounded-full border border-linea px-[10px] py-[5px] font-cuerpo text-[10px] font-medium leading-none"

function Bloque({
  hilo,
  titulo,
  children,
  boton,
  escenario,
  escenarioClassName,
  tinte,
}: {
  hilo: string
  titulo: string
  children: ReactNode
  boton: ReactNode
  escenario: ReactNode
  escenarioClassName?: string
  tinte: string
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-14">
      <div className="max-w-[480px]">
        <span aria-hidden="true" className={cn("mb-6 block h-1 w-12 rounded-[2px]", hilo)} />
        <h2 className={H2}>{titulo}</h2>
        {children}
        {boton}
      </div>
      <div
        className={cn(
          "flex justify-center rounded-escenario px-[clamp(16px,4vw,48px)] py-[clamp(32px,5vw,56px)]",
          tinte,
          escenarioClassName,
        )}
      >
        {escenario}
      </div>
    </div>
  )
}

function BotonSecundario({ seccion, children }: { seccion: string; children: ReactNode }) {
  return (
    <Boton
      href={PLATAFORMA.rutas.registro}
      variante="secundario"
      fullWidthMobile
      className="mt-8"
      trackEvent="clic_crear_catalogo"
      trackData={{ seccion }}
    >
      {children}
    </Boton>
  )
}

function EscenarioCategoria() {
  const miniaturas = [IMG.floreroVidrio, IMG.florero2, IMG.floreroCeramica]
  return (
    <MarcoCelular height={540}>
      <div className="border-b border-linea px-4 pb-3 pt-5">
        <div className="font-cuerpo text-[10px] font-medium leading-none text-texto-secundario">Decoración</div>
        <div className="mt-[6px] font-titulos text-[18px] font-bold leading-[1.1]">Floreros y jarrones</div>
      </div>
      <div className="flex gap-[6px] px-4 py-[10px]">
        <span className={CHIP_ACTIVO}>Floreros</span>
        <span className={CHIP}>Cuadros</span>
        <span className={CHIP}>Velas</span>
      </div>
      <Image
        src={IMG.floreroVidrio.src}
        alt={IMG.floreroVidrio.alt}
        width={400}
        height={400}
        className="mx-4 mt-1 block aspect-square h-auto w-[calc(100%-32px)] rounded-[8px] bg-fondo-alterno object-cover"
      />
      <div className="flex gap-[6px] px-4 py-2">
        {miniaturas.map((m, i) => (
          <Image
            key={m.src}
            src={m.src}
            alt={m.alt}
            width={88}
            height={88}
            className={cn(
              "h-11 w-11 rounded-[6px] bg-fondo-alterno object-cover",
              i === 0 ? "border-2 border-tinta" : "border border-linea",
            )}
          />
        ))}
      </div>
      <div className="px-4 py-1">
        <div className="font-cuerpo text-[14px] font-semibold leading-[1.3]">{IMG.floreroVidrio.alt}</div>
        <div className="font-cuerpo text-[14px] font-bold leading-[1.5]">{formatoGs(IMG.floreroVidrio.precio)}</div>
      </div>
    </MarcoCelular>
  )
}

function EscenarioWhatsApp() {
  return (
    <MarcoCelular height={540} pantallaClassName="flex flex-col bg-fondo-alterno">
      <div className="flex items-center gap-[10px] border-b border-linea bg-white px-[14px] pb-3 pt-5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-linea font-cuerpo text-[12px] font-semibold leading-none text-tinta">
          MG
        </span>
        <div>
          <div className="font-cuerpo text-[13px] font-semibold leading-[1.2]">María G.</div>
          <div className="font-cuerpo text-[10px] leading-[1.3] text-texto-secundario">en línea</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2 px-3 py-4">
        <div className="max-w-[86%] self-start rounded-[12px_12px_12px_4px] border border-linea bg-white p-2">
          <Image
            src={IMG.alfombra.src}
            alt={IMG.alfombra.alt}
            width={400}
            height={300}
            className="block aspect-[4/3] h-auto w-full rounded-[8px] bg-fondo-alterno object-cover"
          />
          <div className="mt-2 font-cuerpo text-[12px] font-bold leading-[1.3]">{IMG.alfombra.alt}</div>
          <div className="font-cuerpo text-[12px] font-medium leading-[1.4] text-texto-secundario">
            {formatoGs(IMG.alfombra.precio)}
          </div>
          <div className="mt-[6px] font-cuerpo text-[12px] leading-[1.45]">
            Hola, me interesa este producto. ¿Está disponible?
          </div>
          <div className="mt-1 text-right font-cuerpo text-[9px] leading-none text-texto-secundario">15:02</div>
        </div>
        <div className="max-w-[80%] self-end rounded-[12px_12px_4px_12px] bg-tinta px-[10px] py-2 font-cuerpo text-[12px] leading-[1.45] text-white">
          ¡Sí! Te lo reservo. ¿Retirás o te lo enviamos?
        </div>
      </div>
    </MarcoCelular>
  )
}

function EscenarioIA() {
  return (
    <div className="grid w-full max-w-[460px] grid-cols-[1fr_1fr] gap-3">
      <figure className="m-0 row-span-2">
        <Image
          src={IMG.lampara.src}
          alt={`${IMG.lampara.alt}, foto original`}
          width={300}
          height={400}
          className="block aspect-[3/4] h-auto w-full rounded-[8px] bg-fondo-alterno object-cover"
        />
        <figcaption className="mt-2 font-cuerpo text-[14px] leading-[1.4] text-texto-secundario">Tu foto</figcaption>
      </figure>
      <figure className="m-0">
        <PlaceholderFoto
          label="Captura real: foto en ambiente"
          className="aspect-[4/3] p-3 text-[12px] leading-[1.4]"
        />
        <figcaption className="mt-2 font-cuerpo text-[14px] leading-[1.4] text-texto-secundario">
          En ambiente, con IA
        </figcaption>
      </figure>
      <div className="border-t-[1.5px] border-tinta pt-3">
        <div className="font-cuerpo text-[14px] font-semibold leading-[1.3]">{IMG.lampara.alt}</div>
        <p className="m-0 mt-[6px] font-cuerpo text-[13px] leading-[1.5] text-texto-secundario">
          Lámpara de mesa con pantalla de tela y base liviana. Luz cálida para el living o la mesa de luz.
        </p>
      </div>
    </div>
  )
}

export function Beneficios() {
  return (
    <section aria-label="Beneficios" className="katalo-seccion">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[clamp(88px,11vw,144px)]">
        <Bloque
          hilo="bg-nanduti-amarillo"
          titulo="Todo tu negocio en un link."
          tinte="bg-tinte-amarillo"
          escenario={<EscenarioCategoria />}
          boton={<BotonSecundario seccion="beneficio_link">Armar mi vidriera</BotonSecundario>}
        >
          <p className={P}>Categorías, subcategorías y varias fotos por producto, ordenado como una vidriera.</p>
          <p className="m-0 mt-5 font-cuerpo text-[16px] font-medium leading-[1.4] text-tinta">
            Tu link: <span className="text-primario">{PLATAFORMA.dominio}/tu-tienda</span>
          </p>
        </Bloque>

        <Bloque
          hilo="bg-nanduti-verde"
          titulo="Consultas que llegan listas."
          tinte="bg-tinte-verde"
          escenarioClassName="min-[1024px]:-order-1"
          escenario={<EscenarioWhatsApp />}
          boton={<BotonSecundario seccion="beneficio_whatsapp">Recibir consultas así</BotonSecundario>}
        >
          <p className={P}>
            Tu cliente toca “Consultar” y te escribe por WhatsApp con el nombre, la foto y el precio del producto.
            Respondés y cerrás.
          </p>
        </Bloque>

        <Bloque
          hilo="bg-nanduti-fucsia"
          titulo="Fotos y descripciones con IA."
          tinte="bg-tinte-fucsia"
          escenario={<EscenarioIA />}
          boton={<BotonSecundario seccion="beneficio_ia">Probar con mis fotos</BotonSecundario>}
        >
          <p className={P}>
            A partir de una foto, generá otras vistas del producto o una foto en ambiente, y escribí nombre y
            descripción en segundos.
          </p>
        </Bloque>
      </div>
    </section>
  )
}
