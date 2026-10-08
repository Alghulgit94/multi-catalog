import { NextRequest, NextResponse } from "next/server"

/**
 * Cron diario (vercel.json). Paso 7 de la etapa 1: enviar los recordatorios de
 * dia 3 y dia 6 y pausar las tiendas sin verificar cuyo plazo vencio
 * (stores.verification_deadline).
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  return NextResponse.json({ ok: true, processed: 0 })
}
