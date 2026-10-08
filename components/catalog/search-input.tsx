"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { useStoreLinks } from "./store-provider"

interface SearchInputProps {
  defaultValue?: string
}

export function SearchInput({ defaultValue = "" }: SearchInputProps) {
  const router = useRouter()
  const links = useStoreLinks()
  const searchParams = useSearchParams()

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (e.target.value) {
        params.set("q", e.target.value)
      } else {
        params.delete("q")
      }
      router.push(`${links.catalog()}?${params.toString()}`)
    },
    [router, searchParams, links]
  )

  return (
    <div className="catalog-search">
      <svg
        className="catalog-search__icon"
        width="18"
        height="18"
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
        className="catalog-search__input"
        id="catalog-search"
        placeholder="Buscar por nombre, categoría o palabra clave..."
        aria-label="Buscar en el catálogo"
        defaultValue={defaultValue}
        onChange={handleInput}
      />
    </div>
  )
}
