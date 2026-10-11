import { cookies } from "next/headers"
import { restFetch, restJson } from "../data/rest"
import type { DraftData } from "./schemas"

export const DRAFT_COOKIE = "kt_draft"
const DRAFT_DAYS = 7
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
  const rows = await restJson<DraftRow[]>(
    `onboarding_drafts?id=eq.${id}&claimed_at=is.null&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=id,data,logo_public_id,expires_at,claimed_at&limit=1`
  )
  return rows?.[0] ?? null
}

async function createDraft(data: DraftData): Promise<DraftRow | null> {
  const expires = new Date(Date.now() + DRAFT_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const rows = await restJson<DraftRow[]>("onboarding_drafts?select=id,data,logo_public_id,expires_at,claimed_at", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ data, expires_at: expires }),
  })
  const row = rows?.[0]
  if (!row) return null
  await escribirCookie(row.id)
  return row
}

/** Mezcla `patch` en el borrador (lo crea si no existe) y lo devuelve. */
export async function saveDraft(patch: DraftData): Promise<DraftRow | null> {
  const actual = await getDraft()
  if (!actual) return createDraft(patch)

  const rows = await restJson<DraftRow[]>(
    `onboarding_drafts?id=eq.${actual.id}&select=id,data,logo_public_id,expires_at,claimed_at`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ data: { ...actual.data, ...patch } }),
    }
  )
  return rows?.[0] ?? null
}

export async function setDraftLogo(draftId: string, publicId: string | null): Promise<boolean> {
  const res = await restFetch(`onboarding_drafts?id=eq.${draftId}`, {
    method: "PATCH",
    body: JSON.stringify({ logo_public_id: publicId }),
  })
  return res.ok
}

export async function claimDraft(draftId: string, userId: string): Promise<void> {
  await restFetch(`onboarding_drafts?id=eq.${draftId}`, {
    method: "PATCH",
    body: JSON.stringify({ claimed_at: new Date().toISOString(), claimed_by: userId }),
  })
  ;(await cookies()).delete(DRAFT_COOKIE)
}
