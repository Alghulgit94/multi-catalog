import { z } from "zod"
import { validateStoreSlug } from "../reserved-slugs"

/** Pasos del onboarding, en orden. La cuenta es siempre el último. */
export const PASOS = ["tienda", "logo", "whatsapp", "plan", "cuenta"] as const
export type Paso = (typeof PASOS)[number]

export const PLAN_IDS = ["gratis", "emprendedor", "negocio"] as const
export type PlanId = (typeof PLAN_IDS)[number]

export const PREFIJO_PAIS = "595"

/** Lo que se guarda en `onboarding_drafts.data`. */
export interface DraftData {
  nombre?: string
  slug?: string
  /** Solo dígitos con código de país, p. ej. 595981123456 (mismo formato que stores.whatsapp). */
  whatsapp?: string
  plan?: PlanId
}

/** Quita ceros iniciales y el prefijo de país si lo pegaron completo; deja solo dígitos. */
export function normalizarWhatsapp(entrada: string): string {
  let digitos = entrada.replace(/\D/g, "")
  if (digitos.startsWith(PREFIJO_PAIS)) digitos = digitos.slice(PREFIJO_PAIS.length)
  digitos = digitos.replace(/^0+/, "")
  return digitos
}

export const tiendaSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá el nombre de tu negocio").max(60, "Máximo 60 caracteres"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .superRefine((slug, ctx) => {
      const r = validateStoreSlug(slug)
      if (!r.valid) ctx.addIssue({ code: "custom", message: r.reason })
    }),
})

/** Número local sin prefijo: en Paraguay son 9 dígitos (9XXXXXXXX). */
export const whatsappSchema = z.object({
  whatsapp: z
    .string()
    .transform(normalizarWhatsapp)
    .refine((n) => /^\d{9}$/.test(n), "Ingresá un número válido de 9 dígitos, por ejemplo 981 123 456")
    .transform((n) => `${PREFIJO_PAIS}${n}`),
})

export const planSchema = z.object({ plan: z.enum(PLAN_IDS) })

export const cuentaSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre").max(50),
  apellido: z.string().trim().min(2, "Ingresá tu apellido").max(50),
  email: z.string().trim().toLowerCase().email("Ingresá un email válido"),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
})

/** ¿El borrador tiene todo lo necesario para crear la tienda? */
export function borradorCompleto(d: DraftData): d is Required<Pick<DraftData, "nombre" | "slug" | "whatsapp">> & DraftData {
  return Boolean(d.nombre && d.slug && d.whatsapp)
}
