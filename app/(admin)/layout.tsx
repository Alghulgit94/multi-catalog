import type React from "react"
import type { Metadata } from "next"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { PanelProvider } from "@/contexts/panel-context"
import { requireStoreContext } from "@/lib/auth/session"
import "../globals.css"

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
    <div className="katalo-app font-cuerpo text-tinta antialiased">
      {/* El panel es solo claro: forcedTheme evita que los toasts sigan el tema del sistema. */}
      <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
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
