"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { CatalogCategory, CatalogSubcategory } from "@/lib/catalog-types"
import { useStoreLinks } from "./store-provider"

interface FilterPillsProps {
  categories: CatalogCategory[]
  currentCategory: string
  subcategories: CatalogSubcategory[]
  currentSubcategory: string
}

export function FilterPills({ categories, currentCategory, subcategories, currentSubcategory }: FilterPillsProps) {
  const router = useRouter()
  const links = useStoreLinks()
  const searchParams = useSearchParams()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDrawerOpen])

  function handleCategoryClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "Todos") {
      params.delete("category")
    } else {
      params.set("category", value)
    }
    // Reset subcategoría when changing category
    params.delete("subcategory")
    router.push(`${links.catalog()}?${params.toString()}`)
    setIsDrawerOpen(false)
  }

  function handleSubcategoryClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === currentSubcategory) {
      params.delete("subcategory")
    } else {
      params.set("subcategory", slug)
    }
    router.push(`${links.catalog()}?${params.toString()}`)
    setIsDrawerOpen(false)
  }

  const categoryPills = [
    { label: "Todos", value: "Todos" },
    ...categories.map((c) => ({ label: c.name, value: c.name })),
    { label: "Destacados", value: "Destacados" },
  ]

  // Find the selected category to filter subcategorías
  const selectedCategory = categories.find((c) => c.name === currentCategory)
  const visibleSubcategories = selectedCategory
    ? subcategories.filter((s) => s.categoryId === selectedCategory.id)
    : []

  function renderCategoryBar() {
    return (
      <div className="filter-bar" role="group" aria-label="Filtrar por categoría">
        {categoryPills.map(({ label, value }) => (
          <button
            key={value}
            className={`filter-pill${value === currentCategory ? " filter-pill--active" : ""}`}
            data-category={value}
            onClick={() => handleCategoryClick(value)}
          >
            {label}
          </button>
        ))}
      </div>
    )
  }

  function renderSubcategoryBar() {
    if (visibleSubcategories.length === 0) return null
    return (
      <div className="filter-bar filter-bar--subcategories" role="group" aria-label="Filtrar por subcategoría">
        {visibleSubcategories.map((s) => (
          <button
            key={s.id}
            className={`filter-pill filter-pill--sm${s.slug === currentSubcategory ? " filter-pill--active" : ""}`}
            onClick={() => handleSubcategoryClick(s.slug)}
          >
            {s.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Filter toggle (mobile) — opens the filter drawer */}
      <button
        className="btn btn--secondary btn--sm filter-toggle-btn"
        type="button"
        onClick={() => setIsDrawerOpen(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" /><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
          <line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
          <line x1="4" y1="18" x2="20" y2="18" /><circle cx="11" cy="18" r="2" fill="currentColor" stroke="none" />
        </svg>
        Filtros
      </button>

      {renderCategoryBar()}
      {renderSubcategoryBar()}

      {/* Filter drawer (mobile) */}
      <div
        className={`filter-drawer${isDrawerOpen ? " filter-drawer--open" : ""}`}
        role="dialog"
        aria-label="Filtrar por categoría"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsDrawerOpen(false)
        }}
      >
        <div className="filter-drawer__panel">
          <div className="filter-drawer__header">
            <h2 className="filter-drawer__title">Filtros</h2>
            <button
              className="filter-drawer__close"
              aria-label="Cerrar filtros"
              onClick={() => setIsDrawerOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {renderCategoryBar()}
          {visibleSubcategories.length > 0 && (
            <div className="filter-drawer__subcategories-title">Subcategorías</div>
          )}
          {renderSubcategoryBar()}
        </div>
      </div>
    </div>
  )
}
