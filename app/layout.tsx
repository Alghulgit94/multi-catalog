import type React from "react"
import type { Metadata } from "next"
import { PLATFORM_NAME } from "@/lib/catalog-config"

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
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Material Symbols for the merchant panel */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
