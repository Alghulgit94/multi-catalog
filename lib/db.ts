/**
 * Conexión a D1 con Drizzle. Solo server-side.
 * Nada fuera de lib/data, lib/onboarding y lib/auth debería importar esto: el
 * aislamiento entre tiendas depende de que toda consulta del panel pase por
 * storeDb() o por las lecturas públicas.
 */
import { env } from "cloudflare:workers"
import { drizzle } from "drizzle-orm/d1"
import * as schema from "../db/schema"

export type Db = ReturnType<typeof createDb>

function createDb(d1: D1Database) {
  return drizzle(d1, { schema })
}

let cached: { d1: D1Database; db: Db } | null = null

export function getDb(): Db {
  const d1 = (env as { DB: D1Database }).DB
  if (!cached || cached.d1 !== d1) cached = { d1, db: createDb(d1) }
  return cached.db
}

export { schema }

/** Código de error de SQLite/D1 para traducirlo a un mensaje legible. */
export function dbErrorCode(err: unknown): "unique" | "foreign_key" | null {
  const msg = String((err as { message?: string; cause?: { message?: string } })?.cause?.message ?? (err as Error)?.message ?? "")
  if (/UNIQUE constraint failed/i.test(msg)) return "unique"
  if (/FOREIGN KEY constraint failed/i.test(msg)) return "foreign_key"
  return null
}
