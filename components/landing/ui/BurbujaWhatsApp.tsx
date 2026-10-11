"use client"

import Image from "next/image"
import { MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Burbuja de consulta flotante sobre el marco de celular del hero. Es la
 * única animación automática de toda la landing: aparece una vez a los
 * 900ms (fade + translateY), o instantánea si prefers-reduced-motion.
 */
export function BurbujaWhatsApp({
  producto,
  mensaje,
  hora,
  className,
}: {
  producto: { src: string; alt: string }
  mensaje: string
  hora: string
  className?: string
}) {
  const [visible, setVisible] = useState(false)
  const [animar, setAnimar] = useState(true)

  useEffect(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducir) {
      setAnimar(false)
      setVisible(true)
      return
    }
    const id = setTimeout(() => setVisible(true), 900)
    return () => clearTimeout(id)
  }, [])

  return (
    <div
      role="img"
      aria-label={`Mensaje de WhatsApp recibido: consulta por la ${producto.alt}`}
      className={cn(
        "absolute z-[3] w-[252px] rounded-[14px_14px_14px_4px] border border-linea bg-white p-3",
        animar && "transition-[opacity,transform] duration-[400ms] ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      <div className="mb-[10px] flex items-center gap-[6px] font-cuerpo text-[11px] font-semibold leading-none text-texto-secundario">
        <MessageCircle size={14} strokeWidth={1.5} className="text-tinta" aria-hidden="true" />
        Nueva consulta por WhatsApp
      </div>
      <div className="flex items-start gap-[10px]">
        <Image
          src={producto.src}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 flex-none rounded-[8px] bg-fondo-alterno object-cover"
        />
        <p className="m-0 font-cuerpo text-[13px] leading-[1.45] text-tinta">{mensaje}</p>
      </div>
      <div className="mt-[6px] text-right font-cuerpo text-[10px] leading-none text-texto-secundario">{hora}</div>
    </div>
  )
}
