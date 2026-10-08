"use client"

import { useEffect } from "react"
import { useStoreLinks } from "./store-provider"

interface MobileMenuProps {
  whatsappHref: string | null
}

export function MobileMenu({ whatsappHref }: MobileMenuProps) {
  const links = useStoreLinks()
  useEffect(() => {
    const menuBtn = document.getElementById("menu-btn")
    const mobileMenu = document.getElementById("mobile-menu")
    const menuClose = document.getElementById("menu-close")

    if (!menuBtn || !mobileMenu) return

    const openMenu = () => {
      mobileMenu.classList.add("mobile-menu--open")
      document.body.style.overflow = "hidden"
    }

    const closeMenu = () => {
      mobileMenu.classList.remove("mobile-menu--open")
      document.body.style.overflow = ""
    }

    menuBtn.addEventListener("click", openMenu)
    menuClose?.addEventListener("click", closeMenu)
    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) closeMenu()
    })

    return () => {
      menuBtn.removeEventListener("click", openMenu)
    }
  }, [])

  return (
    <div
      className="mobile-menu"
      id="mobile-menu"
      role="dialog"
      aria-label="Menú de navegación"
    >
      <div className="mobile-menu__panel">
        <button
          className="mobile-menu__close"
          id="menu-close"
          aria-label="Cerrar menú"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <a href={links.home} className="mobile-menu__link">
          Inicio
        </a>
        <a href={links.catalog()} className="mobile-menu__link">
          Catálogo
        </a>
        <a href={links.catalog({ category: "Destacados" })} className="mobile-menu__link">
          Destacados
        </a>
        {whatsappHref && (
        <a
          href={whatsappHref}
          className="mobile-menu__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        )}
      </div>
    </div>
  )
}
