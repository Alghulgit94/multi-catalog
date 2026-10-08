import type React from "react"
import type { Metadata } from "next"
import { Inter, IBM_Plex_Mono } from "next/font/google"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { PanelProvider } from "@/contexts/panel-context"
import { requireStoreContext } from "@/lib/auth/session"
import "../globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Panel del comercio",
  robots: { index: false, follow: false },
}

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Primera barrera del panel: sin sesión o sin tienda no se renderiza nada.
  const { user, store } = await requireStoreContext()

  return (
    <div className={`${inter.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <PanelProvider
          value={{
            storeName: store.name,
            storeSlug: store.slug,
            userName: user.name || user.email,
            userEmail: user.email,
          }}
        >
          <LayoutWrapper>{children}</LayoutWrapper>
        </PanelProvider>
        <Toaster />
      </ThemeProvider>
    </div>
  )
}
