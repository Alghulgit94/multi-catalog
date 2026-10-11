"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { track } from "@/lib/analytics/track"

type BotonVariante = "primario" | "secundario" | "whatsapp"

type BotonProps = {
  children: ReactNode
  href?: string
  variante?: BotonVariante
  className?: string
  fullWidthMobile?: boolean
  targetBlank?: boolean
  trackEvent?: string
  trackData?: Record<string, unknown>
  onClick?: () => void
}

const VARIANTE_CLASES: Record<BotonVariante, string> = {
  primario: "bg-primario text-white hover:bg-primario-hover",
  secundario: "border-[1.5px] border-tinta text-tinta hover:bg-tinta hover:text-white",
  whatsapp: "bg-whatsapp text-tinta hover:text-tinta hover:opacity-90",
}

export function Boton({
  children,
  href,
  variante = "primario",
  className,
  fullWidthMobile = false,
  targetBlank = false,
  trackEvent,
  trackData,
  onClick,
}: BotonProps) {
  const handleClick = () => {
    if (trackEvent) track(trackEvent, trackData)
    onClick?.()
  }

  const clases = cn(
    "inline-flex h-[48px] items-center justify-center whitespace-nowrap rounded-boton px-6 text-center font-cuerpo text-[16px] font-semibold leading-none transition-colors",
    VARIANTE_CLASES[variante],
    fullWidthMobile && "max-md:w-full",
    className,
  )

  if (href) {
    const esExterno = /^https?:\/\//.test(href) || targetBlank
    if (esExterno) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={clases} onClick={handleClick}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={clases} onClick={handleClick}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={clases} onClick={handleClick}>
      {children}
    </button>
  )
}
