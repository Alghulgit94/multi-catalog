/**
 * Lecturas públicas del catálogo. Cada función recibe el id de la tienda y lo
 * aplica como filtro; el id sale de getPublicStore(), nunca del cliente.
 */

import { and, asc, eq, ne, type SQL } from "drizzle-orm"
import { getDb, schema } from "../db"
import { PRODUCT_WITH, withImages } from "../product-images"
import type { Product, Category, Subcategory } from "../types-catalog"
import type { CatalogProduct, CatalogCategory, CatalogSubcategory } from "../catalog-types"
import { mapProducts, mapProduct, mapCategories, mapSubcategories } from "../catalog-mappers"
import { filterVisibleProducts, filterVisibleCategories } from "../catalog-helpers"

const { products, categories, subcategories } = schema

async function fetchProducts(storeId: string, extra?: SQL, limit?: number): Promise<Product[]> {
  const rows = await getDb().query.products.findMany({
    where: and(eq(products.store_id, storeId), eq(products.is_active, true), eq(products.is_visible, true), extra),
    with: PRODUCT_WITH,
    limit,
  })
  return rows.map(withImages)
}

export async function getPublicCategories(storeId: string): Promise<CatalogCategory[]> {
  const rows = await getDb()
    .select()
    .from(categories)
    .where(and(eq(categories.store_id, storeId), eq(categories.is_active, true), eq(categories.is_visible, true)))
    .orderBy(asc(categories.sort_order), asc(categories.name))
  return filterVisibleCategories(mapCategories(rows as Category[]))
}

export async function getPublicProducts(storeId: string): Promise<CatalogProduct[]> {
  const rows = await fetchProducts(storeId)
  return filterVisibleProducts(mapProducts(rows))
}

export async function getPublicFeaturedProducts(storeId: string): Promise<CatalogProduct[]> {
  const rows = await fetchProducts(storeId, eq(products.featured, true))
  return filterVisibleProducts(mapProducts(rows))
}

export async function getPublicProductBySlug(storeId: string, slug: string): Promise<CatalogProduct | null> {
  const [row] = await fetchProducts(storeId, eq(products.slug, slug), 1)
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
    storeId,
    and(eq(products.category_id, categoryId), ne(products.id, excludeProductId)),
    4
  )
  return filterVisibleProducts(mapProducts(rows))
}

export async function getPublicSubcategories(storeId: string, categoryId?: string): Promise<CatalogSubcategory[]> {
  const rows = await getDb()
    .select()
    .from(subcategories)
    .where(
      and(
        eq(subcategories.store_id, storeId),
        eq(subcategories.is_active, true),
        categoryId ? eq(subcategories.category_id, categoryId) : undefined
      )
    )
    .orderBy(asc(subcategories.sort_order), asc(subcategories.name))
  return mapSubcategories(rows as Subcategory[])
}

export async function getCatalogData(storeId: string) {
  const [products, categories, subcategories] = await Promise.all([
    getPublicProducts(storeId),
    getPublicCategories(storeId),
    getPublicSubcategories(storeId),
  ])
  return { products, categories, subcategories }
}
