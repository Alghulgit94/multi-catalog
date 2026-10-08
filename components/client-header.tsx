"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import { usePanel } from "@/contexts/panel-context"
import { authClient } from "@/lib/auth/client"
import { storeHomePath } from "@/lib/store-links"

export function ClientHeader() {
  const router = useRouter()
  const { storeName, storeSlug, userName, userEmail } = usePanel()
  const { isCollapsed } = useSidebar()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-20 bg-white border-b shadow-sm transition-[left]",
        isCollapsed ? "left-16" : "left-64"
      )}
      style={{
        borderColor: "var(--border)",
        transitionDuration: "var(--duration-base)",
        transitionTimingFunction: "var(--ease-out)",
      }}
    >
      <div className="flex h-full items-center justify-between px-8">
        {/* LEFT */}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-foreground">Administración</h2>
          <p className="text-xs font-medium text-primary">Panel de Catálogos</p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <Link
            href={storeHomePath(storeSlug)}
            target="_blank"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Ver catálogo
          </Link>
          {/* Bell */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {/* Divider */}
          <div className="h-8 w-px bg-border mx-2" />
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                <div className="text-right">
                  <p className="text-sm font-semibold leading-none">{userName}</p>
                  <p className="text-[10px] text-primary mt-1">{storeName}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer transition-colors"
                style={{
                  transitionDuration: "var(--duration-fast)",
                  transitionTimingFunction: "var(--ease-out)"
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
