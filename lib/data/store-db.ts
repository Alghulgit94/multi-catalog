import { restFetch, restJson } from "./rest"

/**
 * Capa única de acceso a datos del panel. Toda consulta sobre tablas de una
 * tienda pasa por acá, y agrega `store_id` por su cuenta: ninguna pantalla ni
 * server action filtra a mano. `store_id` del body se pisa siempre con el de la
 * tienda de la sesión, así que un formulario no puede escribir en otra tienda.
 */
export interface StoreDb {
  readonly storeId: string
  /** `query` son filtros PostgREST sin `store_id` (ej. `id=eq.123&select=*`). */
  select<T>(table: string, query?: string): Promise<T[]>
  count(table: string, query?: string): Promise<number>
  insert(table: string, body: Record<string, unknown>): Promise<Response>
  /** Inserta varias filas; cada una lleva el store_id de la tienda. */
  insertMany(table: string, rows: Record<string, unknown>[]): Promise<Response>
  update(table: string, filter: string, body: Record<string, unknown>): Promise<Response>
  remove(table: string, filter: string): Promise<Response>
}

export function storeDb(storeId: string): StoreDb {
  const scope = `store_id=eq.${encodeURIComponent(storeId)}`
  const withScope = (query?: string) => (query ? `${query}&${scope}` : scope)

  return {
    storeId,

    async select<T>(table: string, query?: string) {
      return (await restJson<T[]>(`${table}?${withScope(query)}`)) ?? []
    },

    async count(table: string, query?: string) {
      const res = await restFetch(`${table}?select=id&${withScope(query)}`, {
        headers: { Prefer: "count=exact", Range: "0-0" },
      })
      return parseInt(res.headers.get("content-range")?.split("/")[1] || "0")
    },

    insert(table, body) {
      return restFetch(table, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ ...body, store_id: storeId }),
      })
    },

    insertMany(table, rows) {
      return restFetch(table, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(rows.map((r) => ({ ...r, store_id: storeId }))),
      })
    },

    update(table, filter, body) {
      const { store_id: _ignored, ...safe } = body
      return restFetch(`${table}?${withScope(filter)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(safe),
      })
    },

    remove(table, filter) {
      return restFetch(`${table}?${withScope(filter)}`, { method: "DELETE" })
    },
  }
}
