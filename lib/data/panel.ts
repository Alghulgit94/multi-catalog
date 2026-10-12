/**
 * Lecturas del panel del comercio. Siempre sobre la tienda de la sesión
 * (requireStoreContext): no reciben ni aceptan un store_id desde afuera.
 */

import { asc, desc, eq } from "drizzle-orm"
import { requireStoreContext } from "../auth/session"
import { schema } from "../db"
import { PRODUCT_WITH, withImages } from "../product-images"
import type { Category, Product, Subcategory } from "../types-catalog"

const { categories, subcategories, products, product_images } = schema

const CATEGORY_REF = { categories: { columns: { id: true, name: true, slug: true } } } as const

export async function getCategories(): Promise<Category[]> {
  const { db } = await requireStoreContext()
  return db.db
    .select()
    .from(categories)
    .where(db.where(categories))
    .orderBy(asc(categories.sort_order), asc(categories.name))
}

export async function getCategory(id: string): Promise<Category | null> {
  const { db } = await requireStoreContext()
  const [row] = await db.db.select().from(categories).where(db.where(categories, eq(categories.id, id))).limit(1)
  return row ?? null
}

export async function getSubcategories(categoryId?: string): Promise<Subcategory[]> {
  const { db } = await requireStoreContext()
  return db.db.query.subcategories.findMany({
    where: db.where(subcategories, categoryId ? eq(subcategories.category_id, categoryId) : undefined),
    with: CATEGORY_REF,
    orderBy: [asc(subcategories.sort_order), asc(subcategories.name)],
  })
}

export async function getSubcategory(id: string): Promise<Subcategory | null> {
  const { db } = await requireStoreContext()
  const row = await db.db.query.subcategories.findFirst({
    where: db.where(subcategories, eq(subcategories.id, id)),
    with: CATEGORY_REF,
  })
  return row ?? null
}

export async function getProducts(options?: {
  categoryId?: string
  isActive?: boolean
  featured?: boolean
  search?: string
}): Promise<Product[]> {
  const { db } = await requireStoreContext()
  const rows = (
    await db.db.query.products.findMany({
      where: db.where(
        products,
        options?.categoryId ? eq(products.category_id, options.categoryId) : undefined,
        options?.isActive !== undefined ? eq(products.is_active, options.isActive) : undefined,
        options?.featured !== undefined ? eq(products.featured, options.featured) : undefined
      ),
      with: PRODUCT_WITH,
      orderBy: desc(products.created_at),
    })
  ).map(withImages)
  if (!options?.search) return rows

  const q = options.search.toLowerCase()
  return rows.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
}

export async function getProduct(id: string): Promise<Product | null> {
  const { db } = await requireStoreContext()
  const row = await db.db.query.products.findFirst({
    where: db.where(products, eq(products.id, id)),
    with: PRODUCT_WITH,
  })
  return row ? withImages(row) : null
}

export async function getDashboardStats() {
  const { db } = await requireStoreContext()
  const [totalProducts, totalCategories, withCover] = await Promise.all([
    db.count(products),
    db.count(categories),
    db.count(product_images, eq(product_images.is_cover, true)),
  ])
  return { totalProducts, totalCategories, noImage: Math.max(0, totalProducts - withCover) }
}

export async function getRecentProducts(limit = 5): Promise<Product[]> {
  const { db } = await requireStoreContext()
  const rows = await db.db.query.products.findMany({
    where: db.where(products),
    with: PRODUCT_WITH,
    orderBy: desc(products.updated_at),
    limit,
  })
  return rows.map(withImages)
}
