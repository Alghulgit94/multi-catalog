/**
 * Platform-wide configuration. Per-store values (name, WhatsApp, branding…)
 * live in the `stores` table, never here.
 */

export const PLATFORM_NAME =
  process.env.NEXT_PUBLIC_PLATFORM_NAME ?? "Katalo"

/** Public origin used for absolute links. Empty = derived from the request. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export const PLACEHOLDER_IMAGE_URL =
  "https://placehold.co/800x600/f0eeea/9ca3af?text=Sin+imagen"

/** Días que tiene una tienda nueva para verificarse (configurable en system_settings). */
export const DEFAULT_VERIFICATION_DAYS = 7
