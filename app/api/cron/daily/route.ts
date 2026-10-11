import { NextRequest, NextResponse } from "next/server"
import { destroyDraftAsset } from "@/lib/cloudinary-upload"
import { restFetch, restJson } from "@/lib/data/rest"

/**
 * Cron diario (vercel.json). Hoy limpia los borradores vencidos del onboarding.
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
  const vencidos =
    (await restJson<Array<{ id: string; logo_public_id: string | null }>>(
      `onboarding_drafts?claimed_at=is.null&expires_at=lt.${encodeURIComponent(ahora)}&select=id,logo_public_id`
    )) ?? []
  await Promise.all(vencidos.map((d) => (d.logo_public_id ? destroyDraftAsset(d.logo_public_id) : Promise.resolve())))
  if (vencidos.length) {
    await restFetch(`onboarding_drafts?id=in.(${vencidos.map((d) => d.id).join(",")})`, { method: "DELETE" })
  }

  // Reclamados hace más de un día: ya cumplieron su función.
  await restFetch(`onboarding_drafts?claimed_at=lt.${encodeURIComponent(haceUnDia)}`, { method: "DELETE" })

  return NextResponse.json({ ok: true, processed: vencidos.length })
}
