"use client"

import { MessageCircle } from "lucide-react"
import { PLATAFORMA } from "@/config/plataforma"
import { track } from "@/lib/analytics/track"

export function WhatsAppFlotante() {
  const href = `https://wa.me/${PLATAFORMA.whatsapp}?text=${encodeURIComponent(
    PLATAFORMA.mensajeWhatsapp(PLATAFORMA.nombre),
  )}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      onClick={() => track("clic_whatsapp", { origen: "flotante" })}
      className="fixed bottom-4 right-4 z-[60] grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-tinta shadow-whatsapp transition-transform hover:scale-105 hover:text-tinta md:bottom-6 md:right-6"
    >
      <MessageCircle size={26} strokeWidth={1.6} aria-hidden="true" />
    </a>
  )
}
