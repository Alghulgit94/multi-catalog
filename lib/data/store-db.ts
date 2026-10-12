import { and, count, eq, type SQL } from "drizzle-orm"
import { getDb, schema, type Db } from "../db"

type StoreTable =
  | typeof schema.categories
  | typeof schema.subcategories
  | typeof schema.products
  | typeof schema.product_images

/**
 * Capa única de acceso a datos del panel. Toda consulta sobre tablas de una
 * tienda pasa por acá: `where()` agrega `store_id` por su cuenta, `withStore()`
 * lo fija en los inserts y `safe()` lo quita de los updates, así que un
 * formulario no puede leer ni escribir en otra tienda.
 */
export interface StoreDb {
  readonly storeId: string
  readonly db: Db
  /** `store_id = <tienda>` AND las condiciones extra. */
  where(table: StoreTable, ...conds: (SQL | undefined)[]): SQL
  /** Fila para insertar, con el store_id de la tienda (pisa el que venga). */
  withStore<T extends object>(row: T): T & { store_id: string }
  /** Cambios para un update, sin store_id: una fila no se puede mover de tienda. */
  safe<T extends object>(row: T): Omit<T, "store_id">
  count(table: StoreTable, ...conds: (SQL | undefined)[]): Promise<number>
}

export function storeDb(storeId: string): StoreDb {
  const db = getDb()
  const where = (table: StoreTable, ...conds: (SQL | undefined)[]) =>
    and(eq(table.store_id, storeId), ...conds) as SQL

  return {
    storeId,
    db,
    where,

    withStore(row) {
      return { ...row, store_id: storeId }
    },

    safe(row) {
      const { store_id: _ignored, ...rest } = row as Record<string, unknown>
      return rest as never
    },

    async count(table, ...conds) {
      const [row] = await db.select({ n: count() }).from(table).where(where(table, ...conds))
      return row?.n ?? 0
    },
  }
}
