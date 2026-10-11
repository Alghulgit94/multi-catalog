"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { MessageCircle, Plus } from "lucide-react"
import { PLATAFORMA } from "@/config/plataforma"
import { PREGUNTAS } from "@/config/preguntas"
import { Boton } from "@/components/landing/ui/Boton"

const COLORES_ICONO = ["text-nanduti-fucsia", "text-primario", "text-nanduti-verde"]

export function Preguntas() {
  const preguntas = PREGUNTAS(PLATAFORMA.nombre)

  return (
    <section
      id="preguntas"
      aria-labelledby="faq-t"
      className="katalo-seccion scroll-mt-[72px] bg-fondo-alterno"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-x-20 gap-y-12">
        <div>
          <h2
            id="faq-t"
            className="m-0 font-titulos text-[clamp(30px,3.6vw,40px)] font-bold leading-[1.1] tracking-[-0.02em]"
          >
            Preguntas frecuentes
          </h2>
          <div className="mt-8">
            <p className="m-0 font-titulos text-[clamp(20px,2vw,24px)] font-semibold leading-[1.3]">
              ¿Te quedó alguna duda?
            </p>
            <Boton
              href={`https://wa.me/${PLATAFORMA.whatsapp}?text=${encodeURIComponent(PLATAFORMA.mensajeWhatsapp(PLATAFORMA.nombre))}`}
              variante="whatsapp"
              targetBlank
              fullWidthMobile
              className="mt-5 gap-[10px]"
              trackEvent="clic_whatsapp"
              trackData={{ origen: "preguntas" }}
            >
              <MessageCircle size={20} strokeWidth={1.5} aria-hidden="true" />
              Escribinos por WhatsApp
            </Boton>
          </div>
        </div>

        <AccordionPrimitive.Root type="single" collapsible defaultValue="item-0" className="border-t border-linea">
          {preguntas.map((p, i) => (
            <AccordionPrimitive.Item key={p.q} value={`item-${i}`} className="border-b border-linea">
              <AccordionPrimitive.Header className="m-0">
                <AccordionPrimitive.Trigger className="group flex min-h-16 w-full cursor-pointer items-center justify-between gap-6 border-0 bg-transparent py-5 text-left font-cuerpo text-[18px] font-semibold leading-[1.35] text-tinta">
                  <span>{p.q}</span>
                  <Plus
                    size={20}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className={`flex-none transition-transform duration-200 group-data-[state=open]:rotate-45 ${COLORES_ICONO[i % 3]}`}
                  />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content
                forceMount
                className="grid transition-[grid-template-rows] duration-[220ms] ease-[ease] data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]"
              >
                <div className="overflow-hidden">
                  <p className="m-0 max-w-[60ch] pb-6 pr-10 font-cuerpo text-[16px] leading-[1.6] text-texto-secundario">
                    {p.a}
                  </p>
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
      </div>
    </section>
  )
}
