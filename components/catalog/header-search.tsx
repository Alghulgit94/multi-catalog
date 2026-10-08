"use client"

import { useRouter } from "next/navigation"
import { useStoreLinks } from "./store-provider"

interface HeaderSearchProps {
  activePage?: "home" | "catalog" | "product"
}

export function HeaderSearch({ activePage }: HeaderSearchProps) {
  const router = useRouter()
  const links = useStoreLinks()

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const value = (e.target as HTMLInputElement).value.trim()
      if (value) {
        router.push(links.catalog({ q: value }))
      }
    }
  }

  return (
    <div className="header__search">
      <svg
        className="header__search-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        className="header__search-input"
        placeholder="Buscar productos..."
        aria-label="Buscar productos"
        id="header-search"
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
