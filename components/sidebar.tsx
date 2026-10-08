"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { PanelLeftClose } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { usePanel } from "@/contexts/panel-context"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const mainNavigation = [
  { name: "Dashboard",  href: "/panel/dashboard",  materialIcon: "dashboard" },
  { name: "Productos",  href: "/panel/productos",  materialIcon: "inventory_2" },
  { name: "Categorías",     href: "/panel/categorias", materialIcon: "category" },
  { name: "Subcategorías",  href: "/panel/subcategorias",  materialIcon: "account_tree" },
]

const cargaModules = [
  { name: "Producto por unidad", href: "/panel/carga/producto",  materialIcon: "inventory_2" },
  { name: "Categoría",               href: "/panel/carga/categoria", materialIcon: "category" },
  { name: "Subcategoría",            href: "/panel/carga/subcategoria",  materialIcon: "account_tree" },
]

const systemNavigation: { name: string; href: string; materialIcon: string }[] = []

export function Sidebar() {
  const pathname = usePathname()
  const { storeName } = usePanel()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const isCargaActive = pathname.startsWith("/panel/carga")
  const [cargaOpen, setCargaOpen] = useState(isCargaActive)

  // Auto-open when navigating into /panel/carga/*
  useEffect(() => {
    if (pathname.startsWith("/panel/carga")) setCargaOpen(true)
  }, [pathname])

  if (isCollapsed) {
    return (
      <aside className="fixed left-0 top-0 z-50 h-full w-16 bg-sidebar flex flex-col">
        {/* Logo area */}
        <div className="flex h-20 items-center justify-center border-b border-white/10 shrink-0">
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-white hover:opacity-90 transition-opacity"
            aria-label="Expandir sidebar"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
          </button>
        </div>

        <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-4">
          <div className="w-full border-b border-white/10 mb-2" />

          {/* Main nav */}
          {mainNavigation.map((item) => {
            const isActive = item.href === "/panel/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-white shadow-lg"
                        : "text-white/50 hover:bg-sidebar-accent hover:text-white"
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.materialIcon}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>{item.name}</TooltipContent>
              </Tooltip>
            )
          })}

          {/* Carga collapsed — single icon to /carga/producto */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/panel/carga/producto"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  isCargaActive
                    ? "bg-sidebar-primary text-white shadow-lg"
                    : "text-white/50 hover:bg-sidebar-accent hover:text-white"
                )}
              >
                <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>Carga</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* System nav */}
          {systemNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-white shadow-lg"
                        : "text-white/50 hover:bg-sidebar-accent hover:text-white"
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.materialIcon}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>{item.name}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </aside>
    )
  }

  return (
    <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center justify-between px-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-white">
            <span className="material-symbols-outlined text-[20px]">home</span>
          </div>
          <span className="text-base font-bold text-white tracking-tight">{storeName}</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Colapsar sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col px-4 py-6 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {/* Main nav items */}
          {mainNavigation.map((item) => {
            const isActive = item.href === "/panel/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-white shadow-lg"
                    : "text-white/70 hover:bg-sidebar-accent hover:text-white"
                )}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">{item.materialIcon}</span>
                <span>{item.name}</span>
              </Link>
            )
          })}

          {/* Carga collapsible group */}
          <button
            onClick={() => setCargaOpen(!cargaOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isCargaActive
                ? "text-white"
                : "text-white/70 hover:bg-sidebar-accent hover:text-white"
            )}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">cloud_upload</span>
            <span className="flex-1 text-left">Carga</span>
            <span
              className={cn(
                "material-symbols-outlined text-[16px] transition-transform duration-200",
                cargaOpen ? "rotate-180" : "rotate-0"
              )}
            >
              expand_more
            </span>
          </button>

          {/* Sub-items */}
          {cargaOpen && (
            <div className="ml-4 flex flex-col gap-0.5 border-l border-white/10 pl-3 mt-0.5">
              {cargaModules.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-white"
                        : "text-white/60 hover:bg-sidebar-accent hover:text-white"
                    )}
                  >
                    <span className="material-symbols-outlined text-[17px] shrink-0">{item.materialIcon}</span>
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Sistema section */}
        <div className="pt-8">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Sistema
          </p>
          <div className="flex flex-col gap-1">
            {systemNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-white shadow-lg"
                      : "text-white/70 hover:bg-sidebar-accent hover:text-white"
                  )}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">{item.materialIcon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex-1" />
      </nav>

      {/* Support card */}
      <div className="p-4 border-t border-white/10">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/70 mb-1">Soporte técnico</p>
          <p className="text-[10px] text-white/40 leading-relaxed">
            ¿Tienes algún problema? Contacta al equipo de soporte para obtener ayuda.
          </p>
        </div>
      </div>
    </aside>
  )
}
