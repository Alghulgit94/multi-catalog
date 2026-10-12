import type React from "react"
import type { Metadata } from "next"
import { PLATFORM_NAME } from "@/lib/catalog-config"
import { bricolage, figtree } from "@/components/landing/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: PLATFORM_NAME, template: `%s | ${PLATFORM_NAME}` },
  description: "Plataforma de catálogos para comercios: cargá tus productos y compartí tu catálogo por WhatsApp.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-PY" className={`${bricolage.variable} ${figtree.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
