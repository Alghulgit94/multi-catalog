/**
 * Lecturas públicas del catálogo. Cada función recibe el id de la tienda y lo
 * aplica como filtro; el id sale de getPublicStore(), nunca del cliente.
 */

import { restJson } from "./rest"
import { PRODUCT_IMAGES_EMBED, withImages } from "../product-images"
import type { Product, Category, Subcategory } from "../types-catalog"
import type { CatalogProduct, CatalogCategory, CatalogSubcategory } from "../catalog-types"
import { mapProducts, mapProduct, mapCategories, mapSubcategories } from "../catalog-mappers"
import { filterVisibleProducts, filterVisibleCategories } from "../catalog-helpers"

const SELECT_PRODUCT = `*, categories(id, name, slug, is_visible), subcategories(id, name, slug), ${PRODUCT_IMAGES_EMBED}`
const ACTIVE = "is_active=eq.true&is_visible=eq.true"

const scope = (storeId: string) => `store_id=eq.${encodeURIComponent(storeId)}`
const productQuery = (storeId: string, extra = "") =>
  `products?select=${encodeURIComponent(SELECT_PRODUCT)}&${scope(storeId)}&${ACTIVE}${extra}`

async function fetchProducts(path: string): Promise<Product[]> {
  return ((await restJson<Product[]>(path)) ?? []).map(withImages)
}

export async function getPublicCategories(storeId: string): Promise<CatalogCategory[]> {
  const rows = await restJson<Category[]>(
    `categories?select=*&${scope(storeId)}&${ACTIVE}&order=sort_order.asc,name.asc`
  )
  return filterVisibleCategories(mapCategories(rows ?? []))
}

export async function getPublicProducts(storeId: string): Promise<CatalogProduct[]> {
  const rows = await fetchProducts(productQuery(storeId))
  return filterVisibleProducts(mapProducts(rows ?? []))
}

export async function getPublicFeaturedProducts(storeId: string): Promise<CatalogProduct[]> {
  const rows = await fetchProducts(productQuery(storeId, "&featured=eq.true"))
  return filterVisibleProducts(mapProducts(rows ?? []))
}

export async function getPublicProductBySlug(storeId: string, slug: string): Promise<CatalogProduct | null> {
  const rows = await fetchProducts(productQuery(storeId, `&slug=eq.${encodeURIComponent(slug)}`))
  const row = rows?.[0]
  if (!row) return null
  const product = mapProduct(row)
  // Re-check visibility after mapping (category visibility included)
  if (!product.isVisible || !product.categoryIsVisible) return null
  return product
}

export async function getPublicRelatedProducts(
  storeId: string,
  categoryId: string,
  excludeProductId: string
): Promise<CatalogProduct[]> {
  const rows = await fetchProducts(
    productQuery(storeId, `&category_id=eq.${categoryId}&id=neq.${excludeProductId}&limit=4`)
  )
  return filterVisibleProducts(mapProducts(rows ?? []))
}

export async function getPublicSubcategories(storeId: string, categoryId?: string): Promise<CatalogSubcategory[]> {
  let query = `subcategories?select=*&${scope(storeId)}&is_active=eq.true&order=sort_order.asc,name.asc`
  if (categoryId) query += `&category_id=eq.${categoryId}`
  const rows = await restJson<Subcategory[]>(query)
  return mapSubcategories(rows ?? [])
}

export async function getCatalogData(storeId: string) {
  const [products, categories, subcategories] = await Promise.all([
    getPublicProducts(storeId),
    getPublicCategories(storeId),
    getPublicSubcategories(storeId),
  ])
  return { products, categories, subcategories }
}
