/**
 * Genera un slug URL-safe a partir de un texto libre (típicamente el nombre).
 * Se usa para autocompletar el campo "Slug" mientras se escribe el nombre.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/**
 * Normaliza lo que el usuario tipea a mano en el campo "Slug".
 *
 * A diferencia de `slugify`, **preserva las mayúsculas** para que un slug de
 * catálogo como "UG25005" sobreviva tal cual. Tampoco recorta el guión final,
 * porque rompería la escritura a mitad de palabra ("alfombra-" → "alfombra").
 */
export function sanitizeSlugInput(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-]+/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
}
