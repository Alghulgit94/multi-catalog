"use client"

import { useRouter } from "next/navigation"
import { LogOut, ShieldCheck } from "lucide-react"
import { LogoKatalo } from "@/components/landing/ui/LogoKatalo"
import { authClient } from "@/lib/auth/client"

/**
 * Estructura del superadmin: misma identidad que el panel del comercio
 * (sidebar en tinta y hoja blanca), con navegación propia y mínima.
 */
export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const router = useRouter()

  async function salir() {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-dvh bg-sidebar md:flex">
      <aside className="flex flex-col text-sidebar-foreground md:fixed md:inset-y-0 md:w-60">
        <div className="flex h-14 items-center justify-between px-4">
          <LogoKatalo variant="horizontal-blanco" height={24} />
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white">Admin</span>
        </div>
        <nav className="hidden px-3 md:block" aria-label="Secciones del superadmin">
          <span className="flex h-9 items-center gap-3 rounded-[10px] bg-white/[0.12] px-3 text-sm font-medium text-white">
            <ShieldCheck className="size-[18px]" strokeWidth={1.5} /> Revisión de tiendas
          </span>
        </nav>
        <div className="mt-auto hidden border-t border-sidebar-border p-3 md:block">
          <p className="truncate px-2 text-xs text-sidebar-foreground/80">{email}</p>
          <button
            type="button"
            onClick={salir}
            className="mt-2 flex h-9 w-full items-center gap-3 rounded-[10px] px-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
          >
            <LogOut className="size-4" strokeWidth={1.5} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="flex-1 md:p-2 md:pl-60">
        <main className="min-h-[calc(100dvh-56px)] bg-white md:min-h-[calc(100dvh-16px)] md:rounded-[20px]">{children}</main>
      </div>
    </div>
  )
}
