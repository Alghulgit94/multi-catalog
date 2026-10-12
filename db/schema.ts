/**
 * Esquema multi-tienda sobre Cloudflare D1 (SQLite), definido con Drizzle.
 *
 * Las migraciones SQL se generan desde acá (`pnpm db:generate`) y se aplican con
 * `pnpm db:migrate:local` / `pnpm db:migrate:remote`.
 *
 * Convenciones:
 *   - Ids: UUID en texto, generados en la app (`crypto.randomUUID()`).
 *   - Fechas de la app: texto ISO-8601 en UTC. Se comparan bien como string y
 *     llegan al código con el mismo formato que antes (Postgres → JSON).
 *   - Booleanos: integer 0/1 que Drizzle expone como boolean.
 *   - Listas y objetos (tags, datos del borrador): JSON en texto.
 *
 * Todo el acceso pasa por lib/data, filtrando siempre por store_id. Las FK
 * compuestas (id, store_id) impiden que un producto apunte a una categoría de
 * otra tienda, aunque el código se equivoque. D1 aplica las FK por defecto.
 */

import { relations, sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  integer,
  real,
  sqliteTable,
  text,
  unique,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"
import type { StoreStatus, MemberRole } from "../lib/store-types"
import type { DraftData } from "../lib/onboarding/schemas"

const nowIso = () => new Date().toISOString()
const NOW_SQL = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
const createdAt = () => text("created_at").notNull().default(NOW_SQL).$defaultFn(nowIso)
const updatedAt = () =>
  text("updated_at").notNull().default(NOW_SQL).$defaultFn(nowIso).$onUpdateFn(nowIso)
const bool = (name: string, value: boolean) => integer(name, { mode: "boolean" }).notNull().default(value)

// ─── Better Auth (user, session, account, verification) ─────────────────────
// Nombres de propiedad = nombres de campo de Better Auth (adapter de Drizzle).

const authTimestamp = (name: string) => integer(name, { mode: "timestamp_ms" })

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  // Marca de superadmin. No se puede setear desde el cliente (ver lib/auth/server.ts).
  isSuperadmin: integer("is_superadmin", { mode: "boolean" }).notNull().default(false),
  createdAt: authTimestamp("created_at").notNull(),
  updatedAt: authTimestamp("updated_at").notNull(),
})

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: authTimestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: authTimestamp("created_at").notNull(),
    updatedAt: authTimestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)]
)

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: authTimestamp("access_token_expires_at"),
    refreshTokenExpiresAt: authTimestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: authTimestamp("created_at").notNull(),
    updatedAt: authTimestamp("updated_at").notNull(),
  },
  (t) => [index("account_user_idx").on(t.userId)]
)

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: authTimestamp("expires_at").notNull(),
    createdAt: authTimestamp("created_at"),
    updatedAt: authTimestamp("updated_at"),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)]
)

// ─── Tiendas ─────────────────────────────────────────────────────────────────

export const stores = sqliteTable(
  "stores",
  {
    id: id(),
    name: text("name").notNull(),
    // Formato (a-z, 0-9 y guiones) validado en la app: lib/reserved-slugs.ts.
    slug: text("slug").notNull().unique(),
    status: text("status").$type<StoreStatus>().notNull().default("active_unverified"),

    // Marca y textos del catálogo
    logo_path: text("logo_path"),
    primary_color: text("primary_color"),
    banner_path: text("banner_path"),
    hero_eyebrow: text("hero_eyebrow"),
    hero_title: text("hero_title"),
    hero_subtitle: text("hero_subtitle"),
    shipping_note: text("shipping_note"),
    tagline: text("tagline"),

    // Contacto
    whatsapp: text("whatsapp"),
    email: text("email"),
    address: text("address"),
    city: text("city"),
    currency: text("currency").notNull().default("PYG"),
    locale: text("locale").notNull().default("es-PY"),

    // Etapa 2: planes (reservado, sin FK todavía)
    plan_id: text("plan_id"),
    // Plan elegido en el onboarding ('gratis' | 'emprendedor' | 'negocio'). Es una
    // intención: los planes pagos se cobran por fuera (asesor o transferencia).
    plan_intent: text("plan_intent"),

    // Verificación
    terms_accepted_at: text("terms_accepted_at"),
    verification_deadline: text("verification_deadline"),
    verified_at: text("verified_at"),
    review_message: text("review_message"),
    reminder_day3_sent_at: text("reminder_day3_sent_at"),
    reminder_day6_sent_at: text("reminder_day6_sent_at"),

    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [
    index("stores_status_idx").on(t.status),
    check("stores_slug_len", sql`length(${t.slug}) between 3 and 30`),
    check(
      "stores_status_check",
      sql`${t.status} in ('active_unverified', 'in_review', 'verified', 'paused', 'suspended')`
    ),
  ]
)

// ─── Miembros (usuario ↔ tienda) ─────────────────────────────────────────────

export const store_members = sqliteTable(
  "store_members",
  {
    id: id(),
    store_id: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").$type<MemberRole>().notNull().default("owner"),
    created_at: createdAt(),
  },
  (t) => [
    unique().on(t.store_id, t.user_id),
    index("store_members_user_idx").on(t.user_id),
    check("store_members_role_check", sql`${t.role} in ('owner', 'editor')`),
  ]
)

// ─── Catálogo ────────────────────────────────────────────────────────────────

export const categories = sqliteTable(
  "categories",
  {
    id: id(),
    store_id: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    image_path: text("image_path"),
    sort_order: integer("sort_order").notNull().default(0),
    is_active: bool("is_active", true),
    is_visible: bool("is_visible", true),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [unique().on(t.store_id, t.slug), unique().on(t.id, t.store_id)]
)

export const subcategories = sqliteTable(
  "subcategories",
  {
    id: id(),
    store_id: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    category_id: text("category_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sort_order: integer("sort_order").notNull().default(0),
    is_active: bool("is_active", true),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [
    unique().on(t.store_id, t.slug),
    unique().on(t.id, t.store_id),
    foreignKey({
      columns: [t.category_id, t.store_id],
      foreignColumns: [categories.id, categories.store_id],
    }).onDelete("cascade"),
  ]
)

export const products = sqliteTable(
  "products",
  {
    id: id(),
    store_id: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    category_id: text("category_id").notNull(),
    // FK simple: SQLite no puede poner en null solo una columna de una FK compuesta.
    subcategory_id: text("subcategory_id").references(() => subcategories.id, { onDelete: "set null" }),
    sku: text("sku"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    short_description: text("short_description"),
    description: text("description"),
    price: real("price"),
    show_price: bool("show_price", true),
    featured: bool("featured", false),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    is_active: bool("is_active", true),
    is_visible: bool("is_visible", true),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [
    unique().on(t.store_id, t.slug),
    unique().on(t.id, t.store_id),
    foreignKey({
      columns: [t.category_id, t.store_id],
      foreignColumns: [categories.id, categories.store_id],
    }).onDelete("restrict"),
    index("products_store_idx").on(t.store_id, t.is_active, t.is_visible),
    index("products_category_idx").on(t.category_id),
  ]
)

// Key de R2 completa (stores/{store_id}/products/...). Un producto tiene como
// máximo una portada; la galería se ordena por sort_order.
export const product_images = sqliteTable(
  "product_images",
  {
    id: id(),
    store_id: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    product_id: text("product_id").notNull(),
    public_id: text("public_id").notNull(),
    sort_order: integer("sort_order").notNull().default(0),
    is_cover: bool("is_cover", false),
    // Reservado para marcar imágenes generadas con IA (etapa 2).
    is_ai_generated: bool("is_ai_generated", false),
    created_at: createdAt(),
  },
  (t) => [
    foreignKey({
      columns: [t.product_id, t.store_id],
      foreignColumns: [products.id, products.store_id],
    }).onDelete("cascade"),
    index("product_images_product_idx").on(t.product_id, t.sort_order),
    uniqueIndex("product_images_one_cover").on(t.product_id).where(sql`${t.is_cover} = 1`),
  ]
)

// ─── Revisión y configuración ────────────────────────────────────────────────

export const review_history = sqliteTable(
  "review_history",
  {
    id: id(),
    store_id: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    admin_id: text("admin_id")
      .notNull()
      .references(() => user.id),
    action: text("action").$type<"approved" | "changes_requested" | "suspended" | "reactivated">().notNull(),
    reason: text("reason"),
    created_at: createdAt(),
  },
  (t) => [
    index("review_history_store_idx").on(t.store_id, t.created_at),
    check(
      "review_history_action_check",
      sql`${t.action} in ('approved', 'changes_requested', 'suspended', 'reactivated')`
    ),
  ]
)

export const system_settings = sqliteTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
})

// ─── Borradores del onboarding ───────────────────────────────────────────────
// El visitante arma su tienda (nombre, logo, WhatsApp, plan) antes de crear la
// cuenta. El id viaja en una cookie httpOnly; al registrarse el borrador se
// convierte en tienda y queda marcado como reclamado.

export const onboarding_drafts = sqliteTable(
  "onboarding_drafts",
  {
    id: id(),
    data: text("data", { mode: "json" }).$type<DraftData>().notNull().default(sql`'{}'`),
    logo_public_id: text("logo_public_id"),
    expires_at: text("expires_at").notNull(),
    claimed_at: text("claimed_at"),
    claimed_by: text("claimed_by"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [index("onboarding_drafts_expires_idx").on(t.expires_at)]
)

// ─── Relaciones (para db.query.*.findMany({ with })) ─────────────────────────

export const storesRelations = relations(stores, ({ many }) => ({
  members: many(store_members),
}))

export const storeMembersRelations = relations(store_members, ({ one }) => ({
  stores: one(stores, { fields: [store_members.store_id], references: [stores.id] }),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  products: many(products),
}))

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  categories: one(categories, { fields: [subcategories.category_id], references: [categories.id] }),
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  categories: one(categories, { fields: [products.category_id], references: [categories.id] }),
  subcategories: one(subcategories, { fields: [products.subcategory_id], references: [subcategories.id] }),
  product_images: many(product_images),
}))

export const productImagesRelations = relations(product_images, ({ one }) => ({
  product: one(products, { fields: [product_images.product_id], references: [products.id] }),
}))
