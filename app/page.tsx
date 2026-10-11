import type { Metadata } from "next"
import { bricolage, figtree } from "@/components/landing/fonts"
import { PLATAFORMA } from "@/config/plataforma"
import { CASOS } from "@/config/casos"
import { PREGUNTAS } from "@/config/preguntas"
import { Encabezado } from "@/components/landing/Encabezado"
import { Hero } from "@/components/landing/Hero"
import { Tiendas } from "@/components/landing/Tiendas"
import { Problema } from "@/components/landing/Problema"
import { ComoFunciona } from "@/components/landing/ComoFunciona"
import { Beneficios } from "@/components/landing/Beneficios"
import { Casos } from "@/components/landing/Casos"
import { Planes } from "@/components/landing/Planes"
import { Preguntas } from "@/components/landing/Preguntas"
import { Cierre } from "@/components/landing/Cierre"
import { Footer } from "@/components/landing/Footer"
import { WhatsAppFlotante } from "@/components/landing/WhatsAppFlotante"

export const metadata: Metadata = {
  title: "Katalo · Tu catálogo online para vender por WhatsApp",
  description:
    "Creá gratis el catálogo de tu negocio, compartilo en un link y recibí consultas por WhatsApp. Hecho para comercios de Paraguay.",
}

export default function PlatformHomePage() {
  const preguntas = PREGUNTAS(PLATAFORMA.nombre)

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: PLATAFORMA.nombre,
        url: `https://${PLATAFORMA.dominio}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: preguntas.map((p) => ({
          "@type": "Question",
          name: p.q,
          acceptedAnswer: { "@type": "Answer", text: p.a },
        })),
      },
    ],
  }

  return (
    <div className={`${bricolage.variable} ${figtree.variable} katalo min-h-screen overflow-x-clip bg-white font-cuerpo text-tinta`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Encabezado />
      <main>
        <Hero />
        <Tiendas casos={CASOS} />
        <Problema />
        <ComoFunciona />
        <Beneficios />
        <Casos casos={CASOS} />
        <Planes />
        <Preguntas />
        <Cierre />
      </main>
      <Footer plataforma={PLATAFORMA} />
      <WhatsAppFlotante />
    </div>
  )
}
