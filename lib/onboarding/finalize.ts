import { eq } from "drizzle-orm"
import { dbErrorCode, getDb, schema } from "../db"
import { renameAsset, storeAssetFolder } from "../media"
import { DEFAULT_VERIFICATION_DAYS } from "../catalog-config"
import { validateStoreSlug } from "../reserved-slugs"
import { claimDraft, getDraft, type DraftRow } from "./draft"
import { borradorCompleto } from "./schemas"

export type FinalizeResult =
  | { ok: true; storeId: string }
  | { ok: false; code: "sin_borrador" | "incompleto" | "slug_tomado" | "error"; error: string }

/** ¿Hay una tienda con ese slug? Compara contra la BD (el formato se valida aparte). */
export async function slugDisponible(slug: string): Promise<boolean> {
  try {
    const rows = await getDb().select({ id: schema.stores.id }).from(schema.stores).where(eq(schema.stores.slug, slug)).limit(1)
    return rows.length === 0
  } catch (e) {
    console.error("[onboarding] no se pudo verificar el slug", e)
    return false
  }
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
  const storeId = crypto.randomUUID()
  const db = getDb()

  // Tienda y membresía en un solo batch (D1 lo ejecuta como transacción): si
  // falla cualquiera de los dos inserts no queda una tienda sin dueño.
  try {
    await db.batch([
      db.insert(schema.stores).values({
        id: storeId,
        name: d.nombre,
        slug: d.slug,
        whatsapp: d.whatsapp,
        email: userEmail,
        plan_intent: d.plan ?? "gratis",
        terms_accepted_at: new Date().toISOString(),
        verification_deadline: deadline,
      }),
      db.insert(schema.store_members).values({ store_id: storeId, user_id: userId, role: "owner" }),
    ])
  } catch (e) {
    console.error("[onboarding] no se pudo crear la tienda", e)
    // UNIQUE: alguien tomó el slug entre la validación y el insert.
    if (dbErrorCode(e) === "unique") return { ok: false, code: "slug_tomado", error: "Ese nombre de tienda ya no está disponible. Elegí otro." }
    return { ok: false, code: "error", error: "No pudimos crear tu tienda. Probá de nuevo en un momento." }
  }

  // El logo es un extra: si no se puede mover, la tienda igual queda creada.
  if (draft.logo_public_id) {
    const destino = `${storeAssetFolder(storeId, "brand")}/logo`
    const nuevo = await renameAsset(draft.logo_public_id, destino)
    if (nuevo) {
      await db.update(schema.stores).set({ logo_path: nuevo }).where(eq(schema.stores.id, storeId))
    }
  }

  await claimDraft(draft.id, userId)
  return { ok: true, storeId }
}
