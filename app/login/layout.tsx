import type React from "react"
import type { Metadata } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="katalo-app font-cuerpo text-tinta antialiased">{children}</div>
}
