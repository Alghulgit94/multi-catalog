import Link from "next/link"
import type { PLATAFORMA } from "@/config/plataforma"
import { LogoKatalo } from "@/components/landing/ui/LogoKatalo"
import { TrackedLink } from "@/components/landing/ui/TrackedLink"

const LINK = "font-cuerpo text-[14px] leading-[1.4] text-texto-sobre-tinta hover:text-white"
const TITULO = "mb-1 font-cuerpo text-[14px] font-semibold leading-none"

export function Footer({ plataforma }: { plataforma: typeof PLATAFORMA }) {
  const año = new Date().getFullYear()
  const waDisplay = "+" + plataforma.whatsapp.replace(/^(\d{3})(\d{3})(\d{3})(\d+)$/, "$1 $2 $3 $4")

  return (
    <>
      <div aria-hidden="true" className="flex h-[6px]">
        <span className="flex-1 bg-nanduti-fucsia" />
        <span className="flex-1 bg-nanduti-amarillo" />
        <span className="flex-1 bg-nanduti-verde" />
        <span className="flex-[2] bg-primario" />
      </div>
      <footer className="bg-tinta px-6 pb-10 pt-[72px] text-white">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-10">
            <div>
              <div className="flex items-center gap-[10px]">
                <span className="block h-[30px] w-[30px] flex-none">
                  <LogoKatalo variant="sello-invertido" height={30} />
                </span>
                <span className="font-titulos text-[20px] font-bold leading-none">{plataforma.nombre}</span>
              </div>
              <p className="m-0 mt-4 max-w-[240px] font-cuerpo text-[14px] leading-[1.6] text-texto-sobre-tinta">
                Catálogos online para comercios de Paraguay.
              </p>
            </div>

            <nav aria-label="Producto" className="flex flex-col gap-3">
              <span className={TITULO}>Producto</span>
              <a href="#como-funciona" className={LINK}>Cómo funciona</a>
              <a href="#planes" className={LINK}>Planes</a>
              <a href="#preguntas" className={LINK}>Preguntas</a>
              <Link href={plataforma.rutas.login} className={LINK}>Iniciar sesión</Link>
            </nav>

            <nav aria-label="Legales" className="flex flex-col gap-3">
              <span className={TITULO}>Legales</span>
              <Link href={plataforma.rutas.terminos} className={LINK}>Términos y condiciones</Link>
              <Link href={plataforma.rutas.privacidad} className={LINK}>Privacidad</Link>
            </nav>

            <div className="flex flex-col gap-3">
              <span className={TITULO}>Contacto</span>
              <TrackedLink
                href={`https://wa.me/${plataforma.whatsapp}?text=${encodeURIComponent(plataforma.mensajeWhatsapp(plataforma.nombre))}`}
                trackEvent="clic_whatsapp"
                trackData={{ origen: "footer" }}
                className={LINK}
              >
                WhatsApp {waDisplay}
              </TrackedLink>
              <span className="font-cuerpo text-[14px] leading-[1.4] text-texto-sobre-tinta">
                Instagram · Facebook (a confirmar)
              </span>
            </div>
          </div>
          <div className="mt-14 border-t border-white/[.14] pt-6 font-cuerpo text-[14px] leading-[1.4] text-texto-sobre-tinta">
            © {año} {plataforma.nombre}. Hecho en Paraguay.
          </div>
        </div>
      </footer>
    </>
  )
}
