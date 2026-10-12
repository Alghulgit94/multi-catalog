"use client"

import type React from "react"
import { useState } from "react"
import { Menu } from "lucide-react"
import { LogoKatalo } from "@/components/landing/ui/LogoKatalo"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import { SidebarContent } from "./sidebar-content"

/**
 * Estructura del panel (como el admin de Shopify): sidebar fijo en tinta y el
 * contenido en una hoja blanca redondeada. En mobile, barra superior + Sheet.
 */
function Shell({ children }: { children: React.ReactNode }) {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div
      className="min-h-dvh bg-sidebar"
      style={{ "--sidebar-w": isCollapsed ? "64px" : "240px" } as React.CSSProperties}
    >
      {/* Escritorio */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 md:block",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent collapsed={isCollapsed} onToggle={toggleSidebar} />
      </aside>

      {/* Mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-sidebar px-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex size-10 items-center justify-center rounded-[10px] text-white hover:bg-sidebar-accent"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </button>
        <LogoKatalo variant="horizontal-blanco" height={22} />
      </header>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] max-w-[85vw] gap-0 border-0 bg-sidebar p-0 text-white">
          <SheetTitle className="sr-only">Menú del panel</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Contenido */}
      <div className={cn("transition-[padding] duration-200 md:p-2", isCollapsed ? "md:pl-16" : "md:pl-60")}>
        <main
          id="contenido"
          className="relative min-h-[calc(100dvh-56px)] bg-white md:min-h-[calc(100dvh-16px)] md:rounded-[20px]"
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={200}>
        <Shell>{children}</Shell>
      </TooltipProvider>
    </SidebarProvider>
  )
}
