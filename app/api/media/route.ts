import { getStoreContext } from "@/lib/auth/session"
import { buildUploadParams, storeAssetFolder, uploadImage } from "@/lib/media"
import { getImageUrl } from "@/lib/media-urls"
import { getDraft, setDraftLogo } from "@/lib/onboarding/draft"

/**
 * Subida de fotos: POST multipart con `file`, `tipo` y `slug` (+ `indice` en
 * la galería). Responde JSON.
 *
 * Es una ruta común y no una server action a propósito: el WAF de Cloudflare
 * bloquea (403 "Attention Required!") algunos envíos binarios que llevan el
 * encabezado `next-action`, por sus reglas contra vulnerabilidades de server
 * actions de React. Además el cliente de server actions de vinext se queda
 * esperando para siempre si recibe ese HTML en vez de una respuesta RSC.
 */

type Tipo = "producto-portada" | "producto-galeria" | "categoria" | "logo"
const TIPOS: readonly Tipo[] = ["producto-portada", "producto-galeria", "categoria", "logo"]
const LOGO_MAX_BYTES = 3 * 1024 * 1024

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return json({ error: "No llegó la foto completa. Probá de nuevo." }, 400)
  }

  const file = form.get("file")
  const tipo = String(form.get("tipo") ?? "") as Tipo
  const slug = String(form.get("slug") ?? "").trim()
  if (!(file instanceof File) || file.size === 0) return json({ error: "Elegí una foto" }, 400)
  if (!TIPOS.includes(tipo)) return json({ error: "Tipo de foto inválido" }, 400)

  // Logo del registro: todavía no hay cuenta, se identifica por el borrador (cookie).
  if (tipo === "logo") {
    if (file.size > LOGO_MAX_BYTES) return json({ error: "La imagen pesa más de 3 MB" }, 400)
    const draft = await getDraft()
    if (!draft) return json({ error: "Tu sesión de registro venció. Volvé al primer paso." }, 401)
    const res = await uploadImage(file, `drafts/${draft.id}`, "logo")
    if (!res.success) return json({ error: res.error }, 400)
    await setDraftLogo(draft.id, res.public_id)
    return json({
      success: true,
      public_id: res.public_id,
      secure_url: getImageUrl(res.public_id, { width: 400, version: String(Date.now()) }),
    })
  }

  const ctx = await getStoreContext()
  if (!ctx) return json({ error: "Tu sesión venció. Ingresá de nuevo." }, 401)
  if (!slug) return json({ error: "Falta el nombre antes de subir la foto" }, 400)

  let folder: string
  let publicId: string
  if (tipo === "categoria") {
    folder = storeAssetFolder(ctx.store.id, "categories")
    publicId = slug
  } else {
    const indice = Number(form.get("indice") ?? 0) || 0
    ;({ assetFolder: folder, publicId } = buildUploadParams(
      ctx.store.id,
      slug,
      tipo === "producto-portada" ? "cover" : "gallery",
      indice
    ))
  }

  const res = await uploadImage(file, folder, publicId)
  if (!res.success) return json({ error: res.error }, 400)
  return json(res)
}
