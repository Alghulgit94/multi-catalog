"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { APIError } from "better-auth/api"
import { auth } from "@/lib/auth/server"
import { getSession, getStoreContext } from "@/lib/auth/session"
import { getImageUrl } from "@/lib/media-urls"
import { destroyDraftAsset, uploadImage } from "@/lib/media"
import { getDraft, saveDraft, setDraftLogo } from "@/lib/onboarding/draft"
import { crearTiendaDesdeBorrador, slugDisponible, validarBorrador } from "@/lib/onboarding/finalize"
import { cuentaSchema, planSchema, tiendaSchema, whatsappSchema } from "@/lib/onboarding/schemas"

type Ok<T = object> = { ok: true } & T
type Fail = { ok: false; error: string }

const ERROR_GENERICO = "No pudimos guardar tus datos. Probá de nuevo."
const LOGO_MAX_BYTES = 3 * 1024 * 1024

/** Limita cuántos borradores nuevos puede abrir una misma IP (en memoria, best-effort). */
const intentos = new Map<string, { n: number; desde: number }>()
async function permitirNuevoBorrador(): Promise<boolean> {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
  const ahora = Date.now()
  const prev = intentos.get(ip)
  if (!prev || ahora - prev.desde > 60 * 60 * 1000) {
    intentos.set(ip, { n: 1, desde: ahora })
    return true
  }
  prev.n += 1
  return prev.n <= 30
}

async function guardar(patch: Parameters<typeof saveDraft>[0]): Promise<boolean> {
  if (!(await getDraft()) && !(await permitirNuevoBorrador())) return false
  return (await saveDraft(patch)) !== null
}

/** Disponibilidad del nickname mientras el visitante escribe. */
export async function verificarSlug(slug: string): Promise<Ok | Fail> {
  const parsed = tiendaSchema.shape.slug.safeParse(slug)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Nickname no válido" }
  if (!(await slugDisponible(parsed.data))) return { ok: false, error: "Ese nickname ya está en uso" }
  return { ok: true }
}

export async function guardarTienda(input: { nombre: string; slug: string }): Promise<Ok | Fail> {
  const parsed = tiendaSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? ERROR_GENERICO }
  if (!(await slugDisponible(parsed.data.slug))) return { ok: false, error: "Ese nickname ya está en uso" }
  if (!(await guardar(parsed.data))) return { ok: false, error: ERROR_GENERICO }
  return { ok: true }
}

export async function guardarWhatsapp(input: { whatsapp: string }): Promise<Ok | Fail> {
  const parsed = whatsappSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? ERROR_GENERICO }
  if (!(await guardar(parsed.data))) return { ok: false, error: ERROR_GENERICO }
  return { ok: true }
}

export async function guardarPlan(input: { plan: string }): Promise<Ok | Fail> {
  const parsed = planSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Elegí un plan válido" }
  if (!(await guardar(parsed.data))) return { ok: false, error: ERROR_GENERICO }
  return { ok: true }
}

export async function subirLogo(formData: FormData): Promise<Ok<{ url: string }> | Fail> {
  const file = formData.get("logo")
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Elegí una imagen" }
  if (!file.type.startsWith("image/")) return { ok: false, error: "El archivo tiene que ser una imagen" }
  if (file.size > LOGO_MAX_BYTES) return { ok: false, error: "La imagen pesa más de 3 MB" }

  const draft = await getDraft()
  if (!draft) return { ok: false, error: "Tu sesión de registro venció. Volvé al primer paso." }

  const res = await uploadImage(file, `drafts/${draft.id}`, "logo")
  if (!res.success) return { ok: false, error: "No pudimos subir el logo. Probá con otra imagen." }

  await setDraftLogo(draft.id, res.public_id)
  return { ok: true, url: urlLogo(res.public_id, true) }
}

export async function quitarLogo(): Promise<Ok | Fail> {
  const draft = await getDraft()
  if (!draft?.logo_public_id) return { ok: true }
  await setDraftLogo(draft.id, null)
  await destroyDraftAsset(draft.logo_public_id)
  return { ok: true }
}

export async function urlLogoDeBorrador(publicId: string | null): Promise<string | null> {
  return publicId ? urlLogo(publicId, false) : null
}

function urlLogo(publicId: string, fresh: boolean) {
  return getImageUrl(publicId, { width: 400, version: fresh ? String(Date.now()) : null })
}

/**
 * Último paso con email y contraseña: crea la cuenta, la tienda y deja la
 * sesión abierta. Si la tienda falla después de crear la cuenta, el usuario
 * queda logueado y /registro le permite reintentar sin volver a registrarse.
 */
export async function crearCuenta(input: {
  nombre: string
  apellido: string
  email: string
  password: string
}): Promise<Fail> {
  const parsed = cuentaSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisá los datos" }
  const { nombre, apellido, email, password } = parsed.data

  // Se valida la tienda ANTES de crear el usuario para no dejar cuentas sueltas.
  const valid = await validarBorrador(await getDraft())
  if (!valid.ok) return { ok: false, error: valid.error }

  let userId: string
  try {
    const result = await auth.api.signUpEmail({
      body: { name: `${nombre} ${apellido}`, email, password },
      headers: await headers(),
    })
    userId = result.user.id
  } catch (e) {
    if (e instanceof APIError) {
      const code = (e.body as { code?: string } | undefined)?.code
      if (code === "USER_ALREADY_EXISTS" || code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
        return { ok: false, error: "Ya hay una cuenta con ese email. Probá ingresando." }
      }
      return { ok: false, error: e.message || "No pudimos crear tu cuenta" }
    }
    console.error("[onboarding] signUpEmail falló", e)
    return { ok: false, error: "No pudimos crear tu cuenta. Probá de nuevo." }
  }

  const tienda = await crearTiendaDesdeBorrador(userId, email)
  if (!tienda.ok) return { ok: false, error: tienda.error }

  redirect("/panel/dashboard")
}

/** Para quien ya tiene sesión pero todavía no tiene tienda (Google o un reintento). */
export async function crearTiendaConSesion(): Promise<Fail> {
  const session = await getSession()
  if (!session) return { ok: false, error: "Tu sesión venció. Ingresá de nuevo." }
  if (await getStoreContext()) redirect("/panel/dashboard")

  const tienda = await crearTiendaDesdeBorrador(session.user.id, session.user.email)
  if (!tienda.ok) return { ok: false, error: tienda.error }

  redirect("/panel/dashboard")
}
