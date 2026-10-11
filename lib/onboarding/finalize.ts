import { restFetch, restJson } from "../data/rest"
import { renameCloudinaryAsset, storeAssetFolder } from "../cloudinary-upload"
import { DEFAULT_VERIFICATION_DAYS } from "../catalog-config"
import { validateStoreSlug } from "../reserved-slugs"
import { claimDraft, getDraft, type DraftRow } from "./draft"
import { borradorCompleto } from "./schemas"

export type FinalizeResult =
  | { ok: true; storeId: string }
  | { ok: false; code: "sin_borrador" | "incompleto" | "slug_tomado" | "error"; error: string }

/** ¿Hay una tienda con ese slug? Compara contra la BD (el formato se valida aparte). */
export async function slugDisponible(slug: string): Promise<boolean> {
  const rows = await restJson<Array<{ id: string }>>(`stores?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`)
  return rows !== null && rows.length === 0
}

/** Valida que el borrador pueda convertirse en tienda, sin crear nada. */
export async function validarBorrador(
  draft: DraftRow | null
): Promise<{ ok: true; draft: DraftRow } | Extract<FinalizeResult, { ok: false }>> {
  if (!draft) return { ok: false, code: "sin_borrador", error: "Tu sesión de registro venció. Empezá de nuevo." }
  if (!borradorCompleto(draft.data)) {
    return { ok: false, code: "incompleto", error: "Faltan datos de tu tienda. Completá los pasos anteriores." }
  }
  if (!validateStoreSlug(draft.data.slug).valid || !(await slugDisponible(draft.data.slug))) {
    return { ok: false, code: "slug_tomado", error: "Ese nombre de tienda ya no está disponible. Elegí otro." }
  }
  return { ok: true, draft }
}

/**
 * Convierte el borrador en tienda del usuario: stores + store_members, mueve el
 * logo a la carpeta de marca y marca el borrador como reclamado. Si falla a
 * mitad no deja filas huérfanas.
 */
export async function crearTiendaDesdeBorrador(userId: string, userEmail: string): Promise<FinalizeResult> {
  const valid = await validarBorrador(await getDraft())
  if (!valid.ok) return valid
  const { draft } = valid
  const d = draft.data as Required<Pick<typeof draft.data, "nombre" | "slug" | "whatsapp">> & typeof draft.data

  const deadline = new Date(Date.now() + DEFAULT_VERIFICATION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const res = await restFetch("stores?select=id", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      name: d.nombre,
      slug: d.slug,
      whatsapp: d.whatsapp,
      email: userEmail,
      plan_intent: d.plan ?? "gratis",
      terms_accepted_at: new Date().toISOString(),
      verification_deadline: deadline,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    console.error("[onboarding] no se pudo crear la tienda", res.status, body)
    // 23505 = unique_violation: alguien tomó el slug entre la validación y el insert.
    if (res.status === 409) return { ok: false, code: "slug_tomado", error: "Ese nombre de tienda ya no está disponible. Elegí otro." }
    return { ok: false, code: "error", error: "No pudimos crear tu tienda. Probá de nuevo en un momento." }
  }

  const storeId = ((await res.json()) as Array<{ id: string }>)[0]?.id
  if (!storeId) return { ok: false, code: "error", error: "No pudimos crear tu tienda. Probá de nuevo en un momento." }

  const member = await restFetch("store_members", {
    method: "POST",
    body: JSON.stringify({ store_id: storeId, user_id: userId, role: "owner" }),
  })
  if (!member.ok) {
    console.error("[onboarding] no se pudo crear la membresía", member.status, await member.text().catch(() => ""))
    await restFetch(`stores?id=eq.${storeId}`, { method: "DELETE" })
    return { ok: false, code: "error", error: "No pudimos crear tu tienda. Probá de nuevo en un momento." }
  }

  // El logo es un extra: si no se puede mover, la tienda igual queda creada.
  if (draft.logo_public_id) {
    const destino = `${storeAssetFolder(storeId, "brand")}/logo`
    const nuevo = await renameCloudinaryAsset(draft.logo_public_id, destino)
    if (nuevo) {
      await restFetch(`stores?id=eq.${storeId}`, { method: "PATCH", body: JSON.stringify({ logo_path: nuevo }) })
    }
  }

  await claimDraft(draft.id, userId)
  return { ok: true, storeId }
}
