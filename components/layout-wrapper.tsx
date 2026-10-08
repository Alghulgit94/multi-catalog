"use client"

import { Sidebar } from "@/components/sidebar"
import { ClientHeader } from "@/components/client-header"
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex h-screen bg-background">
      <ClientHeader />
      <div className="flex flex-1 pt-20 min-h-0">
        <Sidebar />
        <main
          className={cn(
            "flex flex-1 flex-col overflow-y-auto transition-[margin-left] bg-[#F4F5F7]",
            isCollapsed ? "ml-16" : "ml-64"
          )}
          style={{
            transitionDuration: "var(--duration-base)",
            transitionTimingFunction: "var(--ease-out)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  )
}
