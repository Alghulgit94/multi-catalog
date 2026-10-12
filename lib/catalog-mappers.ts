/**
 * Maps raw D1 rows → UI-shaped catalog types.
 * Pure functions — no side effects.
 */

import type { Product, Category, Subcategory } from "./types-catalog"
import type { CatalogProduct, CatalogCategory, CatalogSubcategory } from "./catalog-types"
import {
  getProductCoverUrl,
  getProductOgImageUrl,
  getProductGalleryUrls,
  getCategoryImageUrl,
} from "./media-urls"

export function mapProduct(row: Product): CatalogProduct {
  const categoryRow = row.categories ?? null
  const subcategoryRow = row.subcategories ?? null
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: categoryRow ?? { id: null, name: "Sin categoría", slug: "", is_visible: false },
    subcategory: subcategoryRow ? { id: subcategoryRow.id, name: subcategoryRow.name, slug: subcategoryRow.slug } : null,
    featured: row.featured ?? false,
    price: row.price ?? null,
    showPrice: row.show_price ?? false,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    coverImage: getProductCoverUrl(row),
    ogImage: getProductOgImageUrl(row),
    galleryImages: getProductGalleryUrls(row),
    tags: row.tags ?? [],
    isVisible: row.is_visible ?? false,
    categoryIsVisible: categoryRow ? (categoryRow.is_visible ?? false) : false,
  }
}

export function mapSubcategory(row: Subcategory): CatalogSubcategory {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
  }
}

export function mapSubcategories(rows: Subcategory[]): CatalogSubcategory[] {
  return rows.map(mapSubcategory)
}

export function mapProducts(rows: Product[]): CatalogProduct[] {
  return rows.map(mapProduct)
}

export function mapCategory(row: Category): CatalogCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    imageUrl: getCategoryImageUrl(row),
    isVisible: row.is_visible ?? false,
  }
}

export function mapCategories(rows: Category[]): CatalogCategory[] {
  return rows.map(mapCategory)
}
