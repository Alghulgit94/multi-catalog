import type { Metadata } from "next"
import { bricolage, figtree } from "@/components/landing/fonts"
import { PLATAFORMA } from "@/config/plataforma"
import { Encabezado } from "@/components/landing/Encabezado"
import { Footer } from "@/components/landing/Footer"

export const metadata: Metadata = {
  title: "Privacidad",
  robots: { index: false, follow: true },
}

export default function PrivacidadPage() {
  return (
    <div className={`${bricolage.variable} ${figtree.variable} katalo bg-white font-cuerpo text-tinta`}>
      <Encabezado />
      <main className="katalo-seccion mx-auto max-w-[65ch]">
        <h1 className="t-seccion text-tinta">Privacidad</h1>
        <p className="t-cuerpo mt-4 text-texto-secundario">
          Estamos preparando esta página. Mientras tanto, escribinos por WhatsApp si tenés dudas.
        </p>
      </main>
      <Footer plataforma={PLATAFORMA} />
    </div>
  )
}
