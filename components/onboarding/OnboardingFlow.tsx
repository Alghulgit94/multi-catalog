"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { PLATAFORMA } from "@/config/plataforma"
import { PLANES, formatoGs } from "@/config/planes"
import { LogoKatalo } from "@/components/landing/ui/LogoKatalo"
import { authClient } from "@/lib/auth/client"
import { track } from "@/lib/analytics/track"
import { slugify } from "@/lib/slug"
import { validateStoreSlug, STORE_SLUG_MAX } from "@/lib/reserved-slugs"
import { PASOS, normalizarWhatsapp, type Paso, type PlanId } from "@/lib/onboarding/schemas"
import {
  crearCuenta,
  crearTiendaConSesion,
  guardarPlan,
  guardarTienda,
  guardarWhatsapp,
  quitarLogo,
  subirLogo,
  verificarSlug,
} from "@/app/registro/actions"
import { mensajeDeError } from "@/lib/onboarding/mensajes"
import { ONBOARDING_MOCK, mockApi } from "@/lib/onboarding/mock-api"
import { prepararImagen } from "@/lib/image-prep"
import { PhonePreview } from "./PhonePreview"

export interface OnboardingInicial {
  paso: Paso
  nombre: string
  slug: string
  /** Número local sin el prefijo +595. */
  whatsapp: string
  plan: PlanId
  logoUrl: string | null
}

interface Props {
  inicial: OnboardingInicial
  /** Usuario ya logueado pero sin tienda (volvió de Google o reintenta). */
  sesion: { nombre: string; email: string } | null
  googleHabilitado: boolean
  errorInicial: string | null
}

const api = ONBOARDING_MOCK
  ? mockApi
  : { verificarSlug, guardarTienda, guardarWhatsapp, guardarPlan, subirLogo, quitarLogo, crearCuenta, crearTiendaConSesion }

const STORAGE_KEY = "katalo_onboarding"
const SALIDA_MS = 160

const input =
  "block h-12 w-full rounded-boton border border-linea bg-white px-4 font-cuerpo text-[16px] text-tinta placeholder:text-texto-secundario/60 focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/20 disabled:opacity-60"
const botonPrincipal =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-boton bg-primario px-6 font-cuerpo text-[16px] font-semibold text-white transition-colors hover:bg-primario-hover disabled:cursor-not-allowed disabled:bg-primario/40"
const botonLink =
  "mx-auto block cursor-pointer border-0 bg-transparent font-cuerpo text-[15px] font-medium text-texto-secundario underline underline-offset-4 hover:text-tinta"

function Campo({ id, label, children, ayuda }: { id: string; label: string; children: ReactNode; ayuda?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-cuerpo text-[14px] font-semibold text-tinta">
        {label}
      </label>
      {children}
      {ayuda}
    </div>
  )
}

function Titulo({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="m-0 font-titulos text-[clamp(26px,3vw,32px)] font-bold leading-[1.15] tracking-[-0.02em] text-tinta">
        {children}
      </h1>
      {sub && <p className="m-0 mt-3 font-cuerpo text-[16px] leading-[1.5] text-texto-secundario">{sub}</p>}
    </div>
  )
}

function Aviso({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="m-0 rounded-boton bg-tinte-fucsia px-4 py-3 font-cuerpo text-[14px] text-tinta">
      {children}
    </p>
  )
}

export function OnboardingFlow({ inicial, sesion, googleHabilitado, errorInicial }: Props) {
  const router = useRouter()

  const [paso, setPaso] = useState<Paso>(inicial.paso)
  const [fase, setFase] = useState<"idle" | "in" | "out">("idle")
  const [dir, setDir] = useState(1)
  const pasoRef = useRef<Paso>(inicial.paso)

  const [nombre, setNombre] = useState(inicial.nombre)
  const [slug, setSlug] = useState(inicial.slug)
  const slugTocado = useRef(Boolean(inicial.slug))
  const [slugEstado, setSlugEstado] = useState<{ tipo: "idle" | "revisando" | "ok" | "error"; msg?: string }>(
    inicial.slug ? { tipo: "ok" } : { tipo: "idle" }
  )
  const [logoUrl, setLogoUrl] = useState(inicial.logoUrl)
  const [subiendo, setSubiendo] = useState(false)
  const [whatsapp, setWhatsapp] = useState(inicial.whatsapp)
  const [plan, setPlan] = useState<PlanId>(inicial.plan)

  const [cuenta, setCuenta] = useState({ nombre: "", apellido: "", email: "", password: "" })
  const [verClave, setVerClave] = useState(false)

  const [finalizado, setFinalizado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(errorInicial)

  const whatsappCompleto = (() => {
    const local = normalizarWhatsapp(whatsapp)
    return local.length === 9 ? `595${local}` : ""
  })()

  // ── Navegación entre pasos con transición ─────────────────────────────────
  const mostrar = useCallback((destino: Paso, empujarHistorial: boolean) => {
    const actual = pasoRef.current
    if (destino === actual) return
    setDir(PASOS.indexOf(destino) > PASOS.indexOf(actual) ? 1 : -1)
    setError(null)
    pasoRef.current = destino
    if (empujarHistorial) window.history.pushState({ paso: destino }, "", `?paso=${destino}`)
    track("onboarding_paso", { paso: destino, numero: PASOS.indexOf(destino) + 1 })

    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducir) {
      setPaso(destino)
      setFase("in")
      return
    }
    setFase("out")
    window.setTimeout(() => {
      setPaso(destino)
      setFase("in")
    }, SALIDA_MS)
  }, [])

  const ir = useCallback((destino: Paso) => mostrar(destino, true), [mostrar])

  useEffect(() => {
    track("onboarding_iniciado", { paso: inicial.paso })
    window.history.replaceState({ paso: inicial.paso }, "", `?paso=${inicial.paso}`)
    setFase("in")
    const alVolver = (e: PopStateEvent) => {
      const destino = e.state?.paso as Paso | undefined
      if (destino && PASOS.includes(destino)) mostrar(destino, false)
    }
    window.addEventListener("popstate", alVolver)
    return () => window.removeEventListener("popstate", alVolver)
  }, [inicial.paso, mostrar])

  // ── sessionStorage: caché de UX; la fuente de verdad es el borrador del servidor ──
  useEffect(() => {
    try {
      const guardado = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as Partial<OnboardingInicial> | null
      if (!guardado) return
      if (!inicial.nombre && guardado.nombre) setNombre(guardado.nombre)
      if (!inicial.slug && guardado.slug) {
        setSlug(guardado.slug)
        slugTocado.current = true
      }
      if (!inicial.whatsapp && guardado.whatsapp) setWhatsapp(guardado.whatsapp)
    } catch {
      /* sin storage disponible: no pasa nada */
    }
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ nombre, slug, whatsapp }))
    } catch {
      /* ignorar */
    }
  }, [nombre, slug, whatsapp])

  // ── Nickname: se completa solo desde el nombre y se verifica con demora ───
  const cambiarNombre = (v: string) => {
    setNombre(v)
    if (!slugTocado.current) setSlug(slugify(v).slice(0, STORE_SLUG_MAX).replace(/-$/, ""))
  }
  const cambiarSlug = (v: string) => {
    slugTocado.current = true
    setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-+/, "").slice(0, STORE_SLUG_MAX))
  }

  const ultimaConsulta = useRef(0)
  useEffect(() => {
    if (paso !== "tienda") return
    if (!slug) {
      setSlugEstado({ tipo: "idle" })
      return
    }
    const local = validateStoreSlug(slug)
    if (!local.valid) {
      setSlugEstado({ tipo: "error", msg: local.reason })
      return
    }
    setSlugEstado({ tipo: "revisando" })
    const id = ++ultimaConsulta.current
    const t = window.setTimeout(async () => {
      const r = await api.verificarSlug(slug)
      if (id !== ultimaConsulta.current) return
      setSlugEstado(r.ok ? { tipo: "ok" } : { tipo: "error", msg: r.error })
    }, 400)
    return () => window.clearTimeout(t)
  }, [slug, paso])

  // ── Acciones por paso ─────────────────────────────────────────────────────
  async function enviarTienda(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const r = await api.guardarTienda({ nombre, slug })
    setEnviando(false)
    if (!r.ok) return setError(r.error)
    ir("logo")
  }

  async function elegirLogo(file: File | undefined) {
    if (!file) return
    setSubiendo(true)
    setError(null)
    try {
      // Un logo no necesita más de 800 px: la foto del celular se achica antes de subirla.
      const liviana = await prepararImagen(file, 800)
      const fd = new FormData()
      fd.append("logo", liviana)
      const r = await api.subirLogo(fd)
      if (!r.ok) return setError(r.error)
      setLogoUrl(r.url)
    } catch {
      setError("No pudimos subir el logo. Revisá tu conexión y probá de nuevo.")
    } finally {
      setSubiendo(false)
    }
  }

  async function sacarLogo() {
    setLogoUrl(null)
    await api.quitarLogo()
  }

  async function enviarWhatsapp(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const r = await api.guardarWhatsapp({ whatsapp })
    setEnviando(false)
    if (!r.ok) return setError(r.error)
    ir("plan")
  }

  async function elegirPlan(id: PlanId) {
    setPlan(id)
    setEnviando(true)
    setError(null)
    const r = await api.guardarPlan({ plan: id })
    setEnviando(false)
    if (!r.ok) return setError(r.error)
    track("onboarding_plan_elegido", { plan: id })
    ir("cuenta")
  }

  async function enviarCuenta(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    track("onboarding_cuenta_enviada", { metodo: "email", plan })
    const r = await api.crearCuenta(cuenta) // redirige al panel si sale bien
    setEnviando(false)
    if (r && !r.ok) {
      setError(r.error)
      if (!ONBOARDING_MOCK) router.refresh() // si la cuenta quedó creada, pasa al modo "confirmar tienda"
    } else if (ONBOARDING_MOCK) setFinalizado(true)
  }

  async function confirmarConSesion() {
    setEnviando(true)
    setError(null)
    const r = await api.crearTiendaConSesion()
    setEnviando(false)
    if (r && !r.ok) setError(r.error)
    else if (ONBOARDING_MOCK) setFinalizado(true)
  }

  async function conGoogle() {
    setEnviando(true)
    setError(null)
    track("onboarding_cuenta_enviada", { metodo: "google", plan })
    if (ONBOARDING_MOCK) {
      await new Promise((r) => setTimeout(r, 700))
      setEnviando(false)
      setFinalizado(true)
      return
    }
    const { error: err } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/registro/finalizar",
      newUserCallbackURL: "/registro/finalizar",
      errorCallbackURL: "/registro?paso=cuenta&error=google",
    })
    if (err) {
      setEnviando(false)
      setError(mensajeDeError("google"))
    }
  }

  const indice = PASOS.indexOf(paso)
  const urlTienda = `${PLATAFORMA.dominio}/${slug || "tu-tienda"}`
  const planElegido = PLANES.find((p) => p.id === plan) ?? PLANES[0]
  const conPreview = paso !== "plan"

  if (finalizado) {
    return (
      <div className="grid min-h-screen place-items-center bg-white px-6">
        <div className="ob-fade w-full max-w-[440px] text-center font-cuerpo">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-tinte-verde text-nanduti-verde">
            <Check size={28} strokeWidth={2} />
          </span>
          <h1 className="m-0 mt-6 font-titulos text-[clamp(26px,3vw,32px)] font-bold text-tinta">¡Tu catálogo está creado!</h1>
          <p className="m-0 mt-3 text-[16px] leading-[1.5] text-texto-secundario">
            {nombre} ya tiene su link: <strong className="text-tinta">{urlTienda}</strong>
          </p>
          <p className="m-0 mt-6 rounded-boton bg-tinte-amarillo px-4 py-3 text-[14px] text-tinta">
            Modo de prueba: no se guardó nada. En el flujo real acá se te lleva a tu panel, ya logueado.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign("/registro")}
            className={cn(botonPrincipal, "mt-6")}
          >
            Reiniciar prueba
          </button>
        </div>
      </div>
    )
  }

  const atras = indice > 0 && (
    <button
      type="button"
      onClick={() => ir(PASOS[indice - 1])}
      aria-label="Volver al paso anterior"
      className="mb-6 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-linea bg-white text-tinta transition-colors hover:bg-fondo-alterno"
    >
      <ArrowLeft size={18} strokeWidth={1.75} />
    </button>
  )

  return (
    <div className={cn("min-h-screen bg-white", conPreview && "lg:grid lg:grid-cols-2")}>
      <div className="flex min-h-screen flex-col px-6 py-6 sm:px-10">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label={`Ir al inicio de ${PLATAFORMA.nombre}`}>
            <LogoKatalo variant="horizontal" height={28} />
          </Link>
          <Link href={PLATAFORMA.rutas.login} className="font-cuerpo text-[15px] font-medium text-texto-secundario hover:text-tinta">
            Ya tengo cuenta
          </Link>
        </header>

        <div
          className="mt-8 flex gap-2 self-center"
          style={{ width: "min(100%, 440px)" }}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={PASOS.length}
          aria-valuenow={indice + 1}
          aria-label={`Paso ${indice + 1} de ${PASOS.length}`}
        >
          {PASOS.map((p, i) => (
            <span key={p} className="h-1.5 flex-1 overflow-hidden rounded-full bg-linea">
              <span
                className="ob-relleno block h-full w-full rounded-full bg-nanduti-amarillo"
                style={{ transform: `scaleX(${i <= indice ? 1 : 0})` }}
              />
            </span>
          ))}
        </div>

        <main className="flex flex-1 items-center justify-center py-8">
          <div className={cn("w-full", paso === "plan" ? "max-w-[1020px]" : "max-w-[440px]")}>
            <div
              className="ob-paso"
              data-fase={fase}
              style={{ ["--ob-dir" as string]: dir } as CSSProperties}
            >
              {atras}

              {paso === "tienda" && (
                <form onSubmit={enviarTienda} className="flex flex-col gap-5" noValidate>
                  <Titulo sub="Con esto armamos el link de tu catálogo. Después lo podés cambiar.">Tu tienda</Titulo>
                  <Campo id="nombre" label="Nombre del negocio">
                    <input
                      id="nombre"
                      value={nombre}
                      onChange={(e) => cambiarNombre(e.target.value)}
                      placeholder="Ej: Juan Tienda"
                      maxLength={60}
                      autoComplete="organization"
                      autoFocus
                      className={input}
                    />
                  </Campo>
                  <Campo
                    id="slug"
                    label="Nickname"
                    ayuda={
                      <p
                        className={cn(
                          "m-0 min-h-5 font-cuerpo text-[13px]",
                          slugEstado.tipo === "error" ? "text-nanduti-fucsia" : "text-texto-secundario"
                        )}
                        aria-live="polite"
                      >
                        {slugEstado.tipo === "error" && slugEstado.msg}
                        {slugEstado.tipo === "revisando" && "Revisando disponibilidad…"}
                        {slugEstado.tipo === "ok" && (
                          <span className="inline-flex items-center gap-1 text-nanduti-verde">
                            <Check size={14} strokeWidth={2} /> Disponible. Será el link de tu catálogo.
                          </span>
                        )}
                        {slugEstado.tipo === "idle" && "Será el link de tu catálogo."}
                      </p>
                    }
                  >
                    <div className="flex">
                      <span className="inline-flex h-12 flex-none items-center rounded-l-boton border border-r-0 border-linea bg-fondo-alterno px-3 font-cuerpo text-[14px] text-texto-secundario">
                        {PLATAFORMA.dominio}/
                      </span>
                      <input
                        id="slug"
                        value={slug}
                        onChange={(e) => cambiarSlug(e.target.value)}
                        placeholder="juantienda"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className={cn(input, "rounded-l-none")}
                      />
                    </div>
                  </Campo>
                  {error && <Aviso>{error}</Aviso>}
                  <button
                    type="submit"
                    disabled={enviando || nombre.trim().length < 2 || slugEstado.tipo !== "ok"}
                    className={botonPrincipal}
                  >
                    {enviando && <Loader2 size={18} className="animate-spin" />} Continuar
                  </button>
                </form>
              )}

              {paso === "logo" && (
                <div className="flex flex-col gap-5">
                  <Titulo sub="El logo va en la parte superior de tu catálogo. ¡Es lo primero que van a ver tus clientes!">
                    Subí tu logo
                  </Titulo>
                  <Campo id="logo" label="Logo">
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="logo"
                        className="flex h-[120px] w-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-boton border border-dashed border-linea bg-fondo-alterno text-center font-cuerpo text-[14px] text-texto-secundario transition-colors hover:border-primario"
                      >
                        {subiendo ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logoUrl} alt="Tu logo" className="ob-fade h-full w-full rounded-boton object-contain p-2" />
                        ) : (
                          <>
                            <Upload size={20} strokeWidth={1.75} aria-hidden="true" />
                            Subir logo
                          </>
                        )}
                      </label>
                      <input
                        id="logo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={subiendo}
                        onChange={(e) => {
                          void elegirLogo(e.target.files?.[0])
                          e.target.value = ""
                        }}
                      />
                      {logoUrl && !subiendo && (
                        <button type="button" onClick={sacarLogo} className={cn(botonLink, "mx-0 text-[14px]")}>
                          Quitar
                        </button>
                      )}
                    </div>
                  </Campo>
                  {error && <Aviso>{error}</Aviso>}
                  <button type="button" disabled={!logoUrl || subiendo} onClick={() => ir("whatsapp")} className={botonPrincipal}>
                    Guardar y continuar
                  </button>
                  <button type="button" onClick={() => ir("whatsapp")} className={botonLink}>
                    Subir más tarde
                  </button>
                </div>
              )}

              {paso === "whatsapp" && (
                <form onSubmit={enviarWhatsapp} className="flex flex-col gap-5" noValidate>
                  <Titulo sub="Tus clientes te van a consultar por WhatsApp con un solo clic.">Agregá tu WhatsApp</Titulo>
                  <Campo id="whatsapp" label="Número de WhatsApp">
                    <div className="flex">
                      <span className="inline-flex h-12 flex-none items-center rounded-l-boton border border-r-0 border-linea bg-fondo-alterno px-3 font-cuerpo text-[16px] text-tinta">
                        +595
                      </span>
                      <input
                        id="whatsapp"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d\s]/g, "").slice(0, 12))}
                        placeholder="981 123 456"
                        autoFocus
                        className={cn(input, "rounded-l-none")}
                      />
                    </div>
                  </Campo>
                  {error && <Aviso>{error}</Aviso>}
                  <button type="submit" disabled={enviando || !whatsappCompleto} className={botonPrincipal}>
                    {enviando && <Loader2 size={18} className="animate-spin" />} Guardar y continuar
                  </button>
                </form>
              )}

              {paso === "plan" && (
                <div>
                  <div className="text-center">
                    <h1 className="m-0 font-titulos text-[clamp(26px,3vw,32px)] font-bold leading-[1.15] tracking-[-0.02em] text-tinta">
                      Elegí tu plan
                    </h1>
                    <p className="m-0 mt-3 font-cuerpo text-[16px] text-texto-secundario">
                      Empezá gratis y mejorá cuando lo necesites.
                    </p>
                  </div>
                  <div className="ob-escalonado mt-8 grid gap-5 md:grid-cols-3">
                    {PLANES.map((p, i) => (
                      <div
                        key={p.id}
                        style={{ ["--i" as string]: i } as CSSProperties}
                        className={cn(
                          "relative flex flex-col rounded-plan bg-white px-6 py-7",
                          p.id === plan ? "border-2 border-primario" : "border border-linea"
                        )}
                      >
                        {p.destacado && (
                          <span className="absolute -top-[13px] left-6 inline-flex h-[26px] items-center rounded-full bg-nanduti-amarillo px-3 font-cuerpo text-[13px] font-semibold text-tinta">
                            Más elegido
                          </span>
                        )}
                        <h2 className="m-0 font-titulos text-[22px] font-semibold text-tinta">{p.nombre}</h2>
                        <p className="m-0 mt-1 min-h-[42px] font-cuerpo text-[14px] leading-[1.5] text-texto-secundario">{p.frase}</p>
                        <p className="m-0 mt-4 font-titulos text-[30px] font-bold leading-none text-tinta">
                          {formatoGs(p.precioMensual)}
                          <span className="font-cuerpo text-[14px] font-normal text-texto-secundario"> /mes</span>
                        </p>
                        <button
                          type="button"
                          disabled={enviando}
                          onClick={() => elegirPlan(p.id)}
                          className={cn(
                            "mt-5 inline-flex h-11 items-center justify-center rounded-boton px-4 font-cuerpo text-[15px] font-semibold transition-colors disabled:opacity-60",
                            p.destacado
                              ? "bg-primario text-white hover:bg-primario-hover"
                              : "border-[1.5px] border-tinta text-tinta hover:bg-tinta hover:text-white"
                          )}
                        >
                          {p.id === "gratis" ? "Continuar gratis" : `Elegir ${p.nombre}`}
                        </button>
                        <ul className="m-0 mt-5 flex list-none flex-col gap-2 border-t border-linea p-0 pt-5">
                          {p.caracteristicas(PLATAFORMA.nombre)
                            .slice(0, 5)
                            .map((c) => (
                              <li key={c} className="flex items-start gap-2 font-cuerpo text-[14px] leading-[1.4] text-tinta">
                                <Check size={16} strokeWidth={1.75} className="mt-[2px] flex-none text-nanduti-verde" aria-hidden="true" />
                                {c}
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <p className="m-0 mt-6 text-center font-cuerpo text-[14px] text-texto-secundario">
                    En los planes pagos, un asesor te contacta para coordinar el pago (también por transferencia bancaria).
                    Mientras tanto usás tu tienda con el plan Gratis.
                  </p>
                  {error && <div className="mt-4"><Aviso>{error}</Aviso></div>}
                </div>
              )}

              {paso === "cuenta" && (
                <div className="flex flex-col gap-6">
                  <Titulo
                    sub={
                      sesion
                        ? "Confirmá y publicamos tu catálogo."
                        : "Creá tu cuenta para guardar tu catálogo y empezar a cargar productos."
                    }
                  >
                    {sesion ? `Ya casi, ${sesion.nombre.split(" ")[0]}` : "¡Tu catálogo ya está listo!"}
                  </Titulo>

                  <div className="ob-escalonado flex flex-col gap-3 rounded-plan border border-linea bg-fondo-alterno p-4 font-cuerpo text-[14px]">
                    <div style={{ ["--i" as string]: 0 } as CSSProperties} className="flex items-center gap-3">
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="" className="h-10 w-10 rounded-foto bg-white object-contain" />
                      ) : (
                        <span className="grid h-10 w-10 place-items-center rounded-foto bg-white font-titulos text-[16px] font-bold text-tinta">
                          {nombre.trim().charAt(0).toUpperCase() || "K"}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="m-0 truncate font-semibold text-tinta">{nombre}</p>
                        <p className="m-0 truncate text-texto-secundario">{urlTienda}</p>
                      </div>
                    </div>
                    <p style={{ ["--i" as string]: 1 } as CSSProperties} className="m-0 text-texto-secundario">
                      WhatsApp: <span className="text-tinta">+{whatsappCompleto || "—"}</span>
                    </p>
                    <p style={{ ["--i" as string]: 2 } as CSSProperties} className="m-0 text-texto-secundario">
                      Plan: <span className="text-tinta">{planElegido.nombre}</span>
                      {plan !== "gratis" && " · un asesor te contactará para coordinar el pago"}
                    </p>
                  </div>

                  {sesion ? (
                    <>
                      {error && <Aviso>{error}</Aviso>}
                      <button type="button" disabled={enviando} onClick={confirmarConSesion} className={botonPrincipal}>
                        {enviando && <Loader2 size={18} className="animate-spin" />} Crear mi tienda
                      </button>
                    </>
                  ) : (
                    <form onSubmit={enviarCuenta} className="flex flex-col gap-4" noValidate>
                      {googleHabilitado && (
                        <>
                          <button
                            type="button"
                            disabled={enviando}
                            onClick={conGoogle}
                            className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-boton border-[1.5px] border-tinta bg-white font-cuerpo text-[16px] font-semibold text-tinta transition-colors hover:bg-fondo-alterno disabled:opacity-60"
                          >
                            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z" />
                              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
                              <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
                              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                            </svg>
                            Continuar con Google
                          </button>
                          <div className="flex items-center gap-3 font-cuerpo text-[13px] text-texto-secundario">
                            <span className="h-px flex-1 bg-linea" /> o con tu email <span className="h-px flex-1 bg-linea" />
                          </div>
                        </>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <Campo id="c-nombre" label="Nombre">
                          <input
                            id="c-nombre"
                            autoComplete="given-name"
                            value={cuenta.nombre}
                            onChange={(e) => setCuenta({ ...cuenta, nombre: e.target.value })}
                            placeholder="Juan"
                            className={input}
                          />
                        </Campo>
                        <Campo id="c-apellido" label="Apellido">
                          <input
                            id="c-apellido"
                            autoComplete="family-name"
                            value={cuenta.apellido}
                            onChange={(e) => setCuenta({ ...cuenta, apellido: e.target.value })}
                            placeholder="Pérez"
                            className={input}
                          />
                        </Campo>
                      </div>
                      <Campo id="c-email" label="Email">
                        <input
                          id="c-email"
                          type="email"
                          autoComplete="email"
                          value={cuenta.email}
                          onChange={(e) => setCuenta({ ...cuenta, email: e.target.value })}
                          placeholder="email@ejemplo.com"
                          className={input}
                        />
                      </Campo>
                      <Campo id="c-clave" label="Contraseña">
                        <div className="relative">
                          <input
                            id="c-clave"
                            type={verClave ? "text" : "password"}
                            autoComplete="new-password"
                            value={cuenta.password}
                            onChange={(e) => setCuenta({ ...cuenta, password: e.target.value })}
                            placeholder="8+ caracteres"
                            className={cn(input, "pr-12")}
                          />
                          <button
                            type="button"
                            onClick={() => setVerClave(!verClave)}
                            aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
                            className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center border-0 bg-transparent text-texto-secundario hover:text-tinta"
                          >
                            {verClave ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </Campo>
                      {error && <Aviso>{error}</Aviso>}
                      <button
                        type="submit"
                        disabled={enviando || !cuenta.nombre || !cuenta.apellido || !cuenta.email || cuenta.password.length < 8}
                        className={botonPrincipal}
                      >
                        {enviando && <Loader2 size={18} className="animate-spin" />} Crear mi cuenta
                      </button>
                    </form>
                  )}

                  {!sesion && (
                    <p className="m-0 text-center font-cuerpo text-[13px] leading-[1.5] text-texto-secundario">
                      Al crear tu cuenta aceptás los{" "}
                      <Link href={PLATAFORMA.rutas.terminos} className="underline" target="_blank">
                        Términos
                      </Link>{" "}
                      y la{" "}
                      <Link href={PLATAFORMA.rutas.privacidad} className="underline" target="_blank">
                        Política de privacidad
                      </Link>
                      .
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {conPreview && (
        <aside className="hidden items-center justify-center bg-fondo-alterno lg:flex" aria-hidden="true">
          <PhonePreview nombre={nombre} logoUrl={logoUrl} whatsapp={paso === "tienda" || paso === "logo" ? "" : whatsappCompleto} />
        </aside>
      )}
    </div>
  )
}
