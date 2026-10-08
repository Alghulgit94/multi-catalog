/**
 * Lecturas del panel del comercio. Siempre sobre la tienda de la sesión
 * (requireStoreContext): no reciben ni aceptan un store_id desde afuera.
 */

import { requireStoreContext } from "../auth/session"
import { PRODUCT_IMAGES_EMBED, withImages } from "../product-images"
import type { Category, Product, Subcategory } from "../types-catalog"

const PRODUCT_SELECT = `select=*,categories(id,name,slug),subcategories(id,name,slug),${PRODUCT_IMAGES_EMBED}`

export async function getCategories(): Promise<Category[]> {
  const { db } = await requireStoreContext()
  return db.select<Category>("categories", "select=*&order=sort_order.asc,name.asc")
}

export async function getCategory(id: string): Promise<Category | null> {
  const { db } = await requireStoreContext()
  return (await db.select<Category>("categories", `id=eq.${id}&select=*`))[0] ?? null
}

export async function getSubcategories(categoryId?: string): Promise<Subcategory[]> {
  const { db } = await requireStoreContext()
  let query = "select=*,categories(id,name,slug)&order=sort_order.asc,name.asc"
  if (categoryId) query += `&category_id=eq.${categoryId}`
  return db.select<Subcategory>("subcategories", query)
}

export async function getSubcategory(id: string): Promise<Subcategory | null> {
  const { db } = await requireStoreContext()
  return (await db.select<Subcategory>("subcategories", `id=eq.${id}&select=*,categories(id,name,slug)`))[0] ?? null
}

export async function getProducts(options?: {
  categoryId?: string
  isActive?: boolean
  featured?: boolean
  search?: string
}): Promise<Product[]> {
  const { db } = await requireStoreContext()
  let query = `${PRODUCT_SELECT}&order=created_at.desc`
  if (options?.categoryId) query += `&category_id=eq.${options.categoryId}`
  if (options?.isActive !== undefined) query += `&is_active=eq.${options.isActive}`
  if (options?.featured !== undefined) query += `&featured=eq.${options.featured}`

  const rows = (await db.select<Product>("products", query)).map(withImages)
  if (!options?.search) return rows

  const q = options.search.toLowerCase()
  return rows.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
}

export async function getProduct(id: string): Promise<Product | null> {
  const { db } = await requireStoreContext()
  const row = (await db.select<Product>("products", `id=eq.${id}&${PRODUCT_SELECT}`))[0]
  return row ? withImages(row) : null
}

export async function getDashboardStats() {
  const { db } = await requireStoreContext()
  const [totalProducts, totalCategories, withCover] = await Promise.all([
    db.count("products"),
    db.count("categories"),
    db.count("product_images", "is_cover=eq.true"),
  ])
  return { totalProducts, totalCategories, noImage: Math.max(0, totalProducts - withCover) }
}

export async function getRecentProducts(limit = 5): Promise<Product[]> {
  const { db } = await requireStoreContext()
  const rows = await db.select<Product>("products", `${PRODUCT_SELECT}&order=updated_at.desc&limit=${limit}`)
  return rows.map(withImages)
}
