/**
 * Nombres de tienda (slug) que no se pueden usar porque chocan con rutas de la
 * plataforma. Único lugar donde se mantiene la lista: al sumar una página
 * nueva en la raíz, agregarla acá.
 */
export const RESERVED_STORE_SLUGS: readonly string[] = [
  "login",
  "registro",
  "panel",
  "admin",
  "api",
  "planes",
  "precios",
  "ayuda",
  "soporte",
  "terminos",
  "privacidad",
  "blog",
  "contacto",
]

export const STORE_SLUG_MIN = 3
export const STORE_SLUG_MAX = 30

const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type SlugValidation = { valid: true } | { valid: false; reason: string }

/** Valida formato y nombres reservados. La unicidad se comprueba contra la BD. */
export function validateStoreSlug(slug: string): SlugValidation {
  if (slug.length < STORE_SLUG_MIN || slug.length > STORE_SLUG_MAX) {
    return { valid: false, reason: `Debe tener entre ${STORE_SLUG_MIN} y ${STORE_SLUG_MAX} caracteres` }
  }
  if (!SLUG_FORMAT.test(slug)) {
    return { valid: false, reason: "Solo minúsculas, números y guiones (sin guiones al inicio, final ni repetidos)" }
  }
  if (RESERVED_STORE_SLUGS.includes(slug)) {
    return { valid: false, reason: "Ese nombre está reservado por la plataforma" }
  }
  return { valid: true }
}
