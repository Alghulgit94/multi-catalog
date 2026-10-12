import { NextRequest, NextResponse } from "next/server"
import { and, inArray, isNull, lt } from "drizzle-orm"
import { getDb, schema } from "@/lib/db"
import { destroyDraftAsset } from "@/lib/media"

const { onboarding_drafts: drafts } = schema

/**
 * Cron diario (trigger `scheduled` en cloudflare.config.ts → worker/index.ts). Hoy limpia los borradores vencidos del onboarding.
 * Paso 7 de la etapa 1 (pendiente): enviar los recordatorios de dia 3 y dia 6 y
 * pausar las tiendas sin verificar cuyo plazo vencio (stores.verification_deadline).
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const ahora = new Date().toISOString()
  const haceUnDia = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Borradores vencidos sin reclamar: se borra su logo (queda huérfano en drafts/) y la fila.
  const db = getDb()
  const vencidos = await db
    .select({ id: drafts.id, logo_public_id: drafts.logo_public_id })
    .from(drafts)
    .where(and(isNull(drafts.claimed_at), lt(drafts.expires_at, ahora)))
  await Promise.all(vencidos.map((d) => (d.logo_public_id ? destroyDraftAsset(d.logo_public_id) : Promise.resolve())))
  if (vencidos.length) {
    await db.delete(drafts).where(inArray(drafts.id, vencidos.map((d) => d.id)))
  }

  // Reclamados hace más de un día: ya cumplieron su función.
  await db.delete(drafts).where(lt(drafts.claimed_at, haceUnDia))

  return NextResponse.json({ ok: true, processed: vencidos.length })
}
