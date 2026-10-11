/**
 * Modo de prueba del onboarding (NEXT_PUBLIC_ONBOARDING_MOCK=1): reemplaza las
 * server actions para validar solo la UI. No toca la BD, Cloudinary ni auth;
 * todo vive en memoria del navegador.
 */
import { cuentaSchema, planSchema, tiendaSchema, whatsappSchema } from "./schemas"

export const ONBOARDING_MOCK = process.env.NEXT_PUBLIC_ONBOARDING_MOCK === "1"

/** Nicknames "ocupados" para poder probar el mensaje de error. */
export const SLUGS_OCUPADOS_MOCK = ["demo-hogar", "demo-moda", "mitienda"]

const espera = (ms = 450) => new Promise((r) => setTimeout(r, ms))
type Ok<T = object> = { ok: true } & T
type Fail = { ok: false; error: string }

export const mockApi = {
  async verificarSlug(slug: string): Promise<Ok | Fail> {
    await espera(300)
    return SLUGS_OCUPADOS_MOCK.includes(slug) ? { ok: false, error: "Ese nickname ya está en uso" } : { ok: true }
  },
  async guardarTienda(input: { nombre: string; slug: string }): Promise<Ok | Fail> {
    const p = tiendaSchema.safeParse(input)
    if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Revisá los datos" }
    await espera()
    return SLUGS_OCUPADOS_MOCK.includes(p.data.slug) ? { ok: false, error: "Ese nickname ya está en uso" } : { ok: true }
  },
  async guardarWhatsapp(input: { whatsapp: string }): Promise<Ok | Fail> {
    const p = whatsappSchema.safeParse(input)
    if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Revisá el número" }
    await espera()
    return { ok: true }
  },
  async guardarPlan(input: { plan: string }): Promise<Ok | Fail> {
    if (!planSchema.safeParse(input).success) return { ok: false, error: "Elegí un plan válido" }
    await espera(250)
    return { ok: true }
  },
  async subirLogo(formData: FormData): Promise<Ok<{ url: string }> | Fail> {
    const file = formData.get("logo")
    if (!(file instanceof File) || !file.type.startsWith("image/")) return { ok: false, error: "El archivo tiene que ser una imagen" }
    await espera(600)
    return { ok: true, url: URL.createObjectURL(file) }
  },
  async quitarLogo(): Promise<Ok | Fail> {
    return { ok: true }
  },
  async crearCuenta(input: { nombre: string; apellido: string; email: string; password: string }): Promise<Ok | Fail> {
    const p = cuentaSchema.safeParse(input)
    if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Revisá los datos" }
    await espera(900)
    // Para probar el error: un email que empiece con "existe".
    if (p.data.email.startsWith("existe")) return { ok: false, error: "Ya hay una cuenta con ese email. Probá ingresando." }
    return { ok: true }
  },
  async crearTiendaConSesion(): Promise<Ok | Fail> {
    await espera(700)
    return { ok: true }
  },
}
