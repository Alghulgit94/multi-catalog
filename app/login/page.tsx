"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth/client"
import { LogoKatalo } from "@/components/landing/ui/LogoKatalo"
import { Nanduti } from "@/components/landing/ui/Nanduti"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/** Mensajes de Better Auth en voseo. */
function mensajeDeError(code?: string, message?: string) {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "El email o la contraseña no coinciden. Revisalos y probá de nuevo."
    case "TOO_MANY_REQUESTS":
      return "Hiciste muchos intentos. Esperá un minuto y probá de nuevo."
    case "EMAIL_NOT_VERIFIED":
      return "Todavía no verificaste tu email. Revisá tu bandeja de entrada."
    default:
      return message ? "No pudimos iniciar sesión. Probá de nuevo." : "No pudimos iniciar sesión."
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const { error } = await authClient.signIn.email({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      rememberMe: formData.get("remember-me") === "on",
    })

    if (error) {
      setError(mensajeDeError(error.code, error.message))
      setLoading(false)
      return
    }

    router.push("/panel/dashboard")
    router.refresh()
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-fondo-alterno px-4 py-10">
      {/* Ñandutí de cierre, decorativo */}
      <div className="pointer-events-none absolute -right-24 -bottom-24 size-[420px] opacity-40 sm:-right-16 sm:-bottom-16" aria-hidden>
        <Nanduti variante="cierre" className="h-full w-full" />
      </div>

      <div className="relative w-full max-w-[420px]">
        <Link href="/" className="mb-8 flex justify-center" aria-label="Ir a Katalo">
          <LogoKatalo variant="horizontal" height={32} />
        </Link>

        <div className="rounded-[20px] border border-linea bg-white p-6 sm:p-8">
          <h1 className="font-titulos text-[28px] leading-tight font-bold tracking-[-0.02em] text-tinta">
            Ingresá a tu panel
          </h1>
          <p className="mt-1.5 text-[15px] text-texto-secundario">Cargá tus productos y compartí tu catálogo.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-tinta" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                required
                disabled={loading}
                className="h-12"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-tinta" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  required
                  disabled={loading}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-texto-secundario hover:text-tinta"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="size-5" strokeWidth={1.5} /> : <Eye className="size-5" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-tinta">
              <input type="checkbox" name="remember-me" defaultChecked className="size-[18px] rounded-[5px] accent-primario" />
              Mantener la sesión iniciada
            </label>

            {error && (
              <p role="alert" className="rounded-[12px] bg-error-fondo px-4 py-3 text-sm text-[#a82727]">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-[15px] text-texto-secundario">
          ¿Todavía no tenés tu catálogo?{" "}
          <Link href="/registro" className="font-semibold text-primario hover:underline">
            Crear mi catálogo gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
