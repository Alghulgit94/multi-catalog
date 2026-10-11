import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { bricolage, figtree } from "@/components/landing/fonts"
import { OnboardingFlow, type OnboardingInicial } from "@/components/onboarding/OnboardingFlow"
import { getSession, getStoreContext } from "@/lib/auth/session"
import { getImageUrl } from "@/lib/cloudinary-catalog"
import { ONBOARDING_MOCK } from "@/lib/onboarding/mock-api"
import { getDraft } from "@/lib/onboarding/draft"
import { mensajeDeError } from "@/lib/onboarding/mensajes"
import { PASOS, PLAN_IDS, PREFIJO_PAIS, type Paso, type PlanId } from "@/lib/onboarding/schemas"

export const metadata: Metadata = { title: "Creá tu catálogo", robots: { index: false, follow: false } }

const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Primer paso que todavía no tiene sus datos; el visitante no puede saltarse hacia adelante. */
function pasoMaximo(d: { nombre?: string; slug?: string; whatsapp?: string; plan?: string }): Paso {
  if (!d.nombre || !d.slug) return "tienda"
  if (!d.whatsapp) return "logo"
  if (!d.plan) return "plan"
  return "cuenta"
}

export default async function RegistroPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams

  // Modo de prueba de UI: sin sesión ni borrador, no se toca la BD.
  const session = ONBOARDING_MOCK ? null : await getSession()
  if (session && (await getStoreContext())) redirect("/panel/dashboard")

  const draft = ONBOARDING_MOCK ? null : await getDraft()
  const data = draft?.data ?? {}

  const planParam = pick(query.plan)
  const planInicial: PlanId =
    data.plan ?? (PLAN_IDS.includes(planParam as PlanId) ? (planParam as PlanId) : "gratis")

  const maximo = PASOS.indexOf(pasoMaximo(data))
  const pedido = pick(query.paso) as Paso | undefined
  const indicePedido = pedido && PASOS.includes(pedido) ? PASOS.indexOf(pedido) : maximo
  const paso = PASOS[Math.min(indicePedido, maximo)]

  const inicial: OnboardingInicial = {
    paso,
    nombre: data.nombre ?? "",
    slug: data.slug ?? "",
    whatsapp: data.whatsapp?.startsWith(PREFIJO_PAIS) ? data.whatsapp.slice(PREFIJO_PAIS.length) : (data.whatsapp ?? ""),
    plan: planInicial,
    logoUrl: draft?.logo_public_id
      ? getImageUrl(draft.logo_public_id, { width: 400, quality: "auto", format: "auto" })
      : null,
  }

  return (
    <div className={`${bricolage.variable} ${figtree.variable} katalo min-h-screen bg-white font-cuerpo text-tinta`}>
      <OnboardingFlow
        inicial={inicial}
        sesion={session ? { nombre: session.user.name, email: session.user.email } : null}
        googleHabilitado={ONBOARDING_MOCK || Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
        errorInicial={mensajeDeError(pick(query.error))}
      />
    </div>
  )
}
