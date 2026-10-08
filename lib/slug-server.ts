import { slugify } from "./slug"
import type { StoreDb } from "./data/store-db"

/** Tope de sufijos a probar antes de caer al desempate por timestamp. */
const MAX_SLUG_ATTEMPTS = 200

/**
 * Recorta el slug propuesto y, si queda vacío, lo deriva del nombre.
 * Nunca devuelve string vacío: la columna `slug` es NOT NULL.
 */
function normalizeSlugRoot(base: string, fallbackName: string): string {
  const trimmed = (base || "").trim().replace(/^-+|-+$/g, "")
  if (trimmed) return trimmed
  return slugify(fallbackName || "") || "item"
}

/**
 * Devuelve un slug libre dentro de la tienda para `table`, agregando el sufijo
 * `-2`, `-3`, … si hace falta.
 *
 * `categories`, `subcategories` y `products` tienen UNIQUE (store_id, slug),
 * así que sin esto un nombre repetido revienta con el error 23505 de Postgres.
 *
 * `excludeId` es la fila que se está editando: excluirla hace que un slug sin
 * cambios pase intacto, en vez de auto-desambiguarse contra sí mismo.
 *
 * Si la consulta falla devuelve la raíz sin tocar. El UNIQUE de la BD sigue
 * siendo la red de seguridad y quien llama traduce el 23505 a un mensaje legible.
 */
export async function ensureUniqueSlug(
  db: StoreDb,
  table: "products" | "categories" | "subcategories",
  base: string,
  fallbackName: string,
  excludeId?: string
): Promise<string> {
  const root = normalizeSlugRoot(base, fallbackName)

  // `*` es el comodín de PostgREST. Trae `root` y todos los `root-N` de una sola vez.
  const rows = await db.select<{ id: string; slug: string }>(
    table,
    `select=id,slug&slug=like.${encodeURIComponent(root)}*`
  )

  const taken = new Set(rows.filter((r) => r.id !== excludeId).map((r) => r.slug))

  if (!taken.has(root)) return root

  for (let n = 2; n <= MAX_SLUG_ATTEMPTS; n++) {
    const candidate = `${root}-${n}`
    if (!taken.has(candidate)) return candidate
  }

  return `${root}-${Date.now()}`
}

/**
 * Traduce el error de PostgREST a un mensaje en español.
 * El 23505 (violación de UNIQUE) es el único que el usuario puede resolver solo.
 */
export function describeWriteError(
  err: unknown,
  entity: string,
  slug: string,
  fallback: string
): string {
  const e = err as { code?: string; message?: string } | null
  if (e?.code === "23505") {
    return `Ya existe ${entity} con el slug «${slug}». Probá con otro.`
  }
  if (e?.code === "23503") {
    return "La categoría o subcategoría elegida no es válida."
  }
  return e?.message || fallback
}
