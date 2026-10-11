import { NextResponse, type NextRequest } from "next/server"
import { getSession, getStoreContext } from "@/lib/auth/session"
import { crearTiendaDesdeBorrador } from "@/lib/onboarding/finalize"

/**
 * Destino del registro con Google: la cuenta ya existe y hay sesión, falta
 * convertir el borrador del onboarding en tienda.
 */
export async function GET(request: NextRequest) {
  const destino = (path: string) => NextResponse.redirect(new URL(path, request.url))

  const session = await getSession()
  if (!session) return destino("/registro?paso=cuenta&error=sesion")
  if (await getStoreContext()) return destino("/panel/dashboard")

  const tienda = await crearTiendaDesdeBorrador(session.user.id, session.user.email)
  if (!tienda.ok) {
    const paso = tienda.code === "slug_tomado" ? "tienda" : tienda.code === "incompleto" ? "tienda" : "cuenta"
    return destino(`/registro?paso=${paso}&error=${tienda.code}`)
  }
  return destino("/panel/dashboard")
}
