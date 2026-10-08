/**
 * Acceso crudo a PostgREST con la service role key. Solo server-side.
 * Nada fuera de lib/data debería importar esto: el aislamiento entre tiendas
 * depende de que toda consulta pase por storeDb() o por las lecturas públicas.
 */

function config() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
  return { url, key }
}

export function restHeaders(extra?: Record<string, string>): Record<string, string> {
  const { key } = config()
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  }
}

export function restFetch(path: string, init: RequestInit & { headers?: Record<string, string> } = {}) {
  const { url } = config()
  return fetch(`${url}/rest/v1/${path}`, {
    cache: "no-store",
    ...init,
    headers: restHeaders(init.headers),
  })
}

export async function restJson<T>(path: string, init?: RequestInit & { headers?: Record<string, string> }): Promise<T | null> {
  const res = await restFetch(path, init)
  if (!res.ok) {
    console.error("[rest] falló", path.split("?")[0], res.status, await res.text().catch(() => ""))
    return null
  }
  return (await res.json()) as T
}
