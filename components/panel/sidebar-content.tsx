"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronsUpDown, ExternalLink, LogOut, MessageCircle, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { LogoKatalo } from "@/components/landing/ui/LogoKatalo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PLANES } from "@/config/planes"
import { PLATAFORMA } from "@/config/plataforma"
import { usePanel } from "@/contexts/panel-context"
import { authClient } from "@/lib/auth/client"
import { storeHomePath } from "@/lib/store-links"
import { cn } from "@/lib/utils"
import { PANEL_NAV, isActive, type NavItem } from "./nav"

/**
 * Contenido del sidebar (tinta). Lo usan el sidebar de escritorio y el Sheet de
 * mobile. `collapsed` = riel de íconos con tooltips.
 */
export function SidebarContent({
  collapsed = false,
  onToggle,
  onNavigate,
}: {
  collapsed?: boolean
  onToggle?: () => void
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { storeName, storeSlug } = usePanel()

  return (
    <div className="flex h-full flex-col text-sidebar-foreground">
      {/* Marca */}
      <div className={cn("flex h-14 items-center", collapsed ? "justify-center" : "justify-between px-4")}>
        <Link href="/panel/dashboard" onClick={onNavigate} aria-label="Inicio del panel">
          {collapsed ? (
            <LogoKatalo variant="sello-invertido" height={28} />
          ) : (
            <LogoKatalo variant="horizontal-blanco" height={24} />
          )}
        </Link>
        {onToggle && !collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="flex size-8 items-center justify-center rounded-[8px] text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
            aria-label="Achicar menú"
          >
            <PanelLeftClose className="size-[18px]" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Tienda */}
      {!collapsed && (
        <div className="mx-3 mb-3 flex items-center gap-3 rounded-[12px] bg-white/[0.06] px-3 py-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-primario font-titulos text-sm font-bold text-white">
            {storeName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{storeName}</p>
            <a
              href={storeHomePath(storeSlug)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-sidebar-foreground/80 hover:text-white"
            >
              Ver catálogo <ExternalLink className="size-3" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className={cn("flex-1 overflow-y-auto", collapsed ? "px-2" : "px-3")} aria-label="Secciones del panel">
        <ul className="flex flex-col gap-0.5">
          {PANEL_NAV.map((item) => (
            <NavEntry key={item.href} item={item} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </ul>
      </nav>

      {collapsed && onToggle && (
        <div className="flex justify-center pb-2">
          <IconTooltip label="Expandir menú">
            <button
              type="button"
              onClick={onToggle}
              className="flex size-10 items-center justify-center rounded-[10px] text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
              aria-label="Expandir menú"
            >
              <PanelLeftOpen className="size-[18px]" strokeWidth={1.5} />
            </button>
          </IconTooltip>
        </div>
      )}

      {!collapsed && <PlanCard />}
      <AccountMenu collapsed={collapsed} />
    </div>
  )
}

function NavEntry({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  const active = isActive(pathname, item.href, item.match)
  const Icon = item.icon

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active && pathname === item.href ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[10px] text-sm font-medium transition-colors",
        collapsed ? "size-10 justify-center" : "h-9 px-3",
        active ? "bg-white/[0.12] text-white" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
      )}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.5} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )

  return (
    <li>
      {collapsed ? <IconTooltip label={item.label}>{link}</IconTooltip> : link}
      {/* Subsecciones: visibles cuando la sección está activa (como Shopify). */}
      {!collapsed && active && item.children && (
        <ul className="mt-0.5 mb-1 flex flex-col gap-0.5">
          {item.children.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`)
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center rounded-[8px] pr-3 pl-[42px] text-[13px] transition-colors",
                    childActive ? "bg-white/[0.08] font-semibold text-white" : "text-sidebar-foreground/80 hover:text-white"
                  )}
                >
                  {child.label}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

function IconTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

/** Plan elegido en el registro + consulta por WhatsApp para mejorarlo (sin cobro en el panel). */
function PlanCard() {
  const { planId, storeName } = usePanel()
  const indice = Math.max(0, PLANES.findIndex((p) => p.id === planId))
  const plan = PLANES[indice]
  const siguiente = PLANES[indice + 1]

  const mensaje = siguiente
    ? `Hola, tengo el catálogo "${storeName}" en ${PLATAFORMA.nombre} y quiero pasar al plan ${siguiente.nombre}.`
    : ""

  return (
    <div className="mx-3 mb-3 rounded-[12px] border-t-4 border-nanduti-amarillo bg-white/[0.06] px-3.5 pt-3 pb-3.5">
      <p className="text-xs font-medium text-sidebar-foreground/80">Tu plan</p>
      <p className="font-titulos text-base font-semibold text-white">{plan.nombre}</p>
      {siguiente ? (
        <>
          <p className="mt-1 text-xs leading-snug text-sidebar-foreground/80">
            Pasá a {siguiente.nombre} para tener {siguiente.caracteristicas(PLATAFORMA.nombre)[0].toLowerCase()}.
          </p>
          <a
            href={`https://wa.me/${PLATAFORMA.whatsapp}?text=${encodeURIComponent(mensaje)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-9 items-center justify-center gap-2 rounded-[10px] bg-white text-[13px] font-semibold text-tinta hover:bg-fondo-alterno"
          >
            <MessageCircle className="size-4" strokeWidth={1.75} />
            Mejorar plan
          </a>
        </>
      ) : (
        <p className="mt-1 text-xs text-sidebar-foreground/80">Tenés el plan más completo.</p>
      )}
    </div>
  )
}

function AccountMenu({ collapsed }: { collapsed: boolean }) {
  const router = useRouter()
  const { userName, userEmail, storeSlug } = usePanel()
  const iniciales = (userName || userEmail)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("")

  const salir = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <div className={cn("border-t border-sidebar-border", collapsed ? "p-2" : "p-3")}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex w-full items-center gap-3 rounded-[10px] text-left hover:bg-sidebar-accent",
            collapsed ? "size-10 justify-center" : "px-2 py-2"
          )}
          aria-label="Cuenta"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.12] text-xs font-semibold text-white">
            {iniciales}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{userName}</span>
                <span className="block truncate text-xs text-sidebar-foreground/80">{userEmail}</span>
              </span>
              <ChevronsUpDown className="size-4 text-sidebar-foreground/70" strokeWidth={1.5} />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-60">
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-semibold text-tinta">{userName}</p>
            <p className="truncate text-xs text-texto-secundario">{userEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={storeHomePath(storeSlug)} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" strokeWidth={1.5} /> Ver mi catálogo
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={salir} className="text-destructive focus:text-destructive">
            <LogOut className="size-4" strokeWidth={1.5} /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
