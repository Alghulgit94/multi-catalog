/**
 * Pure helper functions for catalog filtering and WhatsApp link generation.
 */

import type { CatalogProduct, CatalogCategory } from "./catalog-types"
import type { PublicStore } from "./store-types"
import { absoluteStoreUrl, storeProductPath } from "./store-links"

export function isVisibleCategory(category: CatalogCategory): boolean {
  return category != null && category.isVisible === true
}

export function isVisibleProduct(product: CatalogProduct): boolean {
  return product.isVisible === true && product.categoryIsVisible === true
}

export function filterVisibleCategories(categories: CatalogCategory[]): CatalogCategory[] {
  return categories.filter(isVisibleCategory)
}

export function filterVisibleProducts(products: CatalogProduct[]): CatalogProduct[] {
  return products.filter(isVisibleProduct)
}

/** WhatsApp de la tienda, opcionalmente con un mensaje armado. Null si la tienda no cargó su número. */
export function buildStoreWhatsAppLink(store: PublicStore, message?: string): string | null {
  if (!store.whatsapp) return null
  const base = `https://wa.me/${store.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export const GENERIC_CONSULT_MESSAGE = "Hola, me gustaría conocer más sobre sus productos."

/**
 * WhatsApp deep link with a prefilled message: product name, price (only when
 * it is meant to be shown) and a direct link to the product detail page.
 */
export function generateWhatsAppLink(
  product: CatalogProduct,
  store: PublicStore,
  siteUrl: string
): string | null {
  const lines = ["Hola, estoy interesado/a en este producto:", "", `*${product.name}*`]

  if (product.showPrice && product.price) {
    lines.push(`Precio: ${formatPrice(product.price, store)}`)
  }
  lines.push(`Ver producto: ${absoluteStoreUrl(siteUrl, storeProductPath(store.slug, product.slug))}`)

  return buildStoreWhatsAppLink(store, lines.join("\n"))
}

export function searchProducts(query: string, products: CatalogProduct[]): CatalogProduct[] {
  if (!query || !query.trim()) return products
  const q = query.toLowerCase().trim()
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.name && p.category.name.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q)))
  )
}

export function filterByCategory(category: string, products: CatalogProduct[]): CatalogProduct[] {
  if (!category || category === "all" || category === "Todos") return products
  if (category === "Destacados") return products.filter((p) => p.featured)
  return products.filter((p) => p.category && p.category.name === category)
}

export function filterBySubcategory(subcategory: string, products: CatalogProduct[]): CatalogProduct[] {
  if (!subcategory || subcategory === "all") return products
  return products.filter((p) => p.subcategory && p.subcategory.slug === subcategory)
}

export function getFilteredProducts(
  query: string,
  category: string,
  products: CatalogProduct[],
  subcategory?: string
): CatalogProduct[] {
  let results = searchProducts(query, products)
  if (category && category !== "all" && category !== "Todos") {
    if (category === "Destacados") {
      results = results.filter((p) => p.featured)
    } else {
      results = results.filter((p) => p.category && p.category.name === category)
    }
  }
  if (subcategory && subcategory !== "all") {
    results = filterBySubcategory(subcategory, results)
  }
  return results
}

export function formatPrice(price: number, store: Pick<PublicStore, "currency" | "locale">): string {
  return new Intl.NumberFormat(store.locale, {
    style: "currency",
    currency: store.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
