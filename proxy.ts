import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

/**
 * Filtro rápido: sin cookie de sesión no se entra a /panel ni /admin.
 * Es solo una comodidad; la validación real (sesión, tienda, rol) se hace en
 * el servidor en cada página y acción (lib/auth/session.ts).
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*"],
}
