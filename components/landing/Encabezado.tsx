"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PLATAFORMA } from "@/config/plataforma"
import { LogoKatalo } from "@/components/landing/ui/LogoKatalo"
import { Boton } from "@/components/landing/ui/Boton"

const LINKS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#planes", label: "Planes" },
  { href: "#preguntas", label: "Preguntas" },
]

export function Encabezado() {
  const [conBorde, setConBorde] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    const onScroll = () => setConBorde(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white transition-[border-color] duration-200",
        conBorde ? "border-linea" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1248px] items-center justify-between gap-3 px-6 max-md:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-[10px] text-tinta" aria-label="Katalo, inicio">
          <span className="block h-[30px] w-[30px] flex-none">
            <LogoKatalo variant="sello" height={30} />
          </span>
          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-titulos text-[20px] font-bold leading-none tracking-[-0.01em]">
            {PLATAFORMA.nombre}
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 min-[900px]:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-cuerpo text-[16px] font-medium leading-none text-tinta hover:text-primario"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2">
          <Link
            href={PLATAFORMA.rutas.login}
            className="hidden px-2 font-cuerpo text-[16px] font-semibold leading-none text-tinta hover:text-primario min-[900px]:inline"
          >
            Iniciar sesión
          </Link>
          <Boton
            href={PLATAFORMA.rutas.registro}
            className="px-[22px] max-md:h-10 max-md:px-3 max-md:text-[14px]"
            trackEvent="clic_crear_catalogo"
            trackData={{ seccion: "encabezado" }}
          >
            Crear mi catálogo
          </Boton>
          <button
            type="button"
            aria-label="Menú"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            className="grid h-11 w-11 cursor-pointer place-items-center bg-transparent p-0 text-tinta min-[900px]:hidden"
            onClick={() => setMenuAbierto((v) => !v)}
          >
            {menuAbierto ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav
          id="menu-movil"
          aria-label="Menú móvil"
          className="flex flex-col border-t border-linea bg-white px-6 pb-6 pt-2 min-[900px]:hidden"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="border-b border-linea py-4 font-cuerpo text-[18px] font-medium leading-none text-tinta"
              onClick={() => setMenuAbierto(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href={PLATAFORMA.rutas.login}
            className="py-4 font-cuerpo text-[18px] font-semibold leading-none text-tinta"
          >
            Iniciar sesión
          </Link>
        </nav>
      )}
    </header>
  )
}
