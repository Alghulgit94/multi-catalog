const MENSAJES_ERROR: Record<string, string> = {
  slug_tomado: "Ese nickname ya no está disponible. Elegí otro.",
  incompleto: "Faltan datos de tu tienda. Completá los pasos.",
  sin_borrador: "Tu sesión de registro venció. Empezá de nuevo.",
  sesion: "Tu sesión venció. Probá de nuevo.",
  google: "No pudimos continuar con Google. Probá de nuevo o usá tu email.",
  error: "No pudimos crear tu tienda. Probá de nuevo.",
}

/** Texto para un código de error que llega por query string (?error=...). */
export const mensajeDeError = (codigo: string | null | undefined) => (codigo ? (MENSAJES_ERROR[codigo] ?? null) : null)
