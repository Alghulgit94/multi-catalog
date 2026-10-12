import { cookies } from "next/headers"
import { and, eq, gt, isNull } from "drizzle-orm"
import { getDb, schema } from "../db"
import type { DraftData } from "./schemas"

export const DRAFT_COOKIE = "kt_draft"
const DRAFT_DAYS = 7
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const { onboarding_drafts: drafts } = schema
const DRAFT_COLUMNS = {
  id: drafts.id,
  data: drafts.data,
  logo_public_id: drafts.logo_public_id,
  expires_at: drafts.expires_at,
  claimed_at: drafts.claimed_at,
}

export interface DraftRow {
  id: string
  data: DraftData
  logo_public_id: string | null
  expires_at: string
  claimed_at: string | null
}

async function leerCookie(): Promise<string | null> {
  const id = (await cookies()).get(DRAFT_COOKIE)?.value
  return id && UUID.test(id) ? id : null
}

async function escribirCookie(id: string) {
  ;(await cookies()).set(DRAFT_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DRAFT_DAYS * 24 * 60 * 60,
  })
}

/** Borrador vigente (no vencido ni reclamado) del visitante, o null. */
export async function getDraft(): Promise<DraftRow | null> {
  const id = await leerCookie()
  if (!id) return null
  const [row] = await getDb()
    .select(DRAFT_COLUMNS)
    .from(drafts)
    .where(and(eq(drafts.id, id), isNull(drafts.claimed_at), gt(drafts.expires_at, new Date().toISOString())))
    .limit(1)
  return row ?? null
}

async function createDraft(data: DraftData): Promise<DraftRow | null> {
  const expires = new Date(Date.now() + DRAFT_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const [row] = await getDb().insert(drafts).values({ data, expires_at: expires }).returning(DRAFT_COLUMNS)
  if (!row) return null
  await escribirCookie(row.id)
  return row
}

/** Mezcla `patch` en el borrador (lo crea si no existe) y lo devuelve. */
export async function saveDraft(patch: DraftData): Promise<DraftRow | null> {
  const actual = await getDraft()
  if (!actual) return createDraft(patch)

  const [row] = await getDb()
    .update(drafts)
    .set({ data: { ...actual.data, ...patch } })
    .where(eq(drafts.id, actual.id))
    .returning(DRAFT_COLUMNS)
  return row ?? null
}

export async function setDraftLogo(draftId: string, publicId: string | null): Promise<boolean> {
  try {
    await getDb().update(drafts).set({ logo_public_id: publicId }).where(eq(drafts.id, draftId))
    return true
  } catch (e) {
    console.error("[onboarding] no se pudo guardar el logo del borrador", e)
    return false
  }
}

export async function claimDraft(draftId: string, userId: string): Promise<void> {
  await getDb()
    .update(drafts)
    .set({ claimed_at: new Date().toISOString(), claimed_by: userId })
    .where(eq(drafts.id, draftId))
  ;(await cookies()).delete(DRAFT_COOKIE)
}
