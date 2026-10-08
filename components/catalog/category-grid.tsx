import type { CatalogCategory } from "@/lib/catalog-types"
import { storeCatalogPath } from "@/lib/store-links"

interface CategoryGridProps {
  storeSlug: string
  categories: CatalogCategory[]
}

export function CategoryGrid({ storeSlug, categories }: CategoryGridProps) {
  return (
    <div className="categories__grid" id="categories-grid">
      {categories.map((cat) => (
        <a
          key={cat.id}
          href={storeCatalogPath(storeSlug, { category: cat.name })}
          className="category-card"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cat.imageUrl} alt={cat.name} className="category-card__image" loading="lazy" />
          <div className="category-card__overlay" />
          <span className="category-card__label">{cat.name}</span>
        </a>
      ))}

      {/* Destacados always last */}
      <a href={storeCatalogPath(storeSlug, { category: "Destacados" })} className="category-card category-card--featured">
        <div className="category-card__overlay" />
        <span className="category-card__label">Destacados</span>
      </a>
    </div>
  )
}
