/**
 * Sube una foto a /api/media desde el navegador. Solo cliente.
 *
 * Achica la foto antes (prepararImagen), corta a los 90 s y reintenta una vez
 * si falla la red o el servidor. Nunca lanza: devuelve { error } con un mensaje
 * para mostrar.
 */
import { prepararImagen } from "./image-prep"

export type TipoFoto = "producto-portada" | "producto-galeria" | "categoria" | "logo"

export type SubidaResultado =
  | { error: string; success?: undefined; public_id?: undefined; secure_url?: undefined }
  | { error?: undefined; success: true; public_id: string; secure_url: string }

const TIMEOUT_MS = 90_000

export async function subirFoto({
  file,
  tipo,
  slug = "",
  indice,
}: {
  file: File
  tipo: TipoFoto
  slug?: string
  indice?: number
}): Promise<SubidaResultado> {
  const liviana = await prepararImagen(file, tipo === "logo" ? 800 : undefined).catch(() => file)

  const body = new FormData()
  body.append("file", liviana)
  body.append("tipo", tipo)
  body.append("slug", slug)
  if (indice !== undefined) body.append("indice", String(indice))

  let ultimoError = "No pudimos subir la foto. Revisá tu internet y probá de nuevo."
  for (let intento = 0; intento < 2; intento++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch("/api/media", { method: "POST", body, signal: controller.signal })
      const data = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null
      if (res.ok && data?.success) return data as SubidaResultado
      if (data?.error) ultimoError = String(data.error)
      else if (res.status === 403) ultimoError = "La conexión bloqueó esta foto. Probá con otra foto."
      // 4xx: el reintento no lo arregla (formato, sesión vencida, etc.).
      if (res.status < 500) return { error: ultimoError }
    } catch (e) {
      ultimoError =
        (e as Error)?.name === "AbortError"
          ? "La subida tardó demasiado. Revisá tu internet y probá de nuevo."
          : "Se cortó la conexión mientras subía la foto. Probá de nuevo."
    } finally {
      clearTimeout(timer)
    }
  }
  return { error: ultimoError }
}
