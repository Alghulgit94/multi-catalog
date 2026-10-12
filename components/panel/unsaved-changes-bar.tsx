"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Barra flotante "Cambios sin guardar · Descartar · Guardar" (patrón de Shopify).
 * Va dentro del <form>: "Guardar" es su botón submit. Se pega arriba de la hoja
 * de contenido mientras la página scrollea.
 */
export function UnsavedChangesBar({
  visible,
  saving,
  message = "Cambios sin guardar",
  saveLabel = "Guardar",
  onDiscard,
}: {
  visible: boolean
  saving?: boolean
  message?: string
  saveLabel?: string
  onDiscard: () => void
}) {
  return (
    <div className="pointer-events-none sticky top-16 z-20 h-0 md:top-4" aria-live="polite">
      <div
        className={cn(
          "pointer-events-auto absolute left-1/2 flex w-max max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-2 rounded-[14px] bg-tinta py-1.5 pr-1.5 pl-4 text-white shadow-xl transition-all duration-200",
          visible || saving ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        )}
        role="region"
        aria-label="Cambios sin guardar"
        hidden={!visible && !saving}
      >
        <span className="mr-2 text-sm font-semibold">{message}</span>
        <button
          type="button"
          onClick={onDiscard}
          disabled={saving}
          className="h-8 rounded-[10px] px-3 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          Descartar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex h-8 items-center gap-2 rounded-[10px] bg-white px-4 text-sm font-semibold text-tinta hover:bg-fondo-alterno disabled:opacity-70"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Guardando…" : saveLabel}
        </button>
      </div>
    </div>
  )
}

/**
 * Detecta si un formulario cambió respecto de su estado inicial: compara una
 * foto de su FormData (+ `extra`, para estado controlado como fotos o selects).
 * También avisa al salir de la página con cambios pendientes.
 */
export function useDirtyForm(formRef: React.RefObject<HTMLFormElement | null>, extra?: unknown) {
  const inicial = useRef<string | null>(null)
  const [dirty, setDirty] = useState(false)

  const foto = useCallback(() => {
    const form = formRef.current
    if (!form) return ""
    const pares: string[] = []
    new FormData(form).forEach((v, k) => pares.push(`${k}=${typeof v === "string" ? v : v.name}`))
    // Casillas sin marcar no están en FormData: se agregan explícitamente.
    form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name]').forEach((c) => {
      pares.push(`${c.name}:checked=${c.checked}`)
    })
    return pares.join("&") + "|" + JSON.stringify(extra ?? null)
  }, [formRef, extra])

  // Foto inicial una sola vez, cuando el form ya está montado.
  useEffect(() => {
    if (inicial.current === null) inicial.current = foto()
  }, [foto])

  const check = useCallback(() => {
    if (inicial.current === null) return
    setDirty(foto() !== inicial.current)
  }, [foto])

  // El estado controlado (`extra`) también cuenta.
  useEffect(() => {
    check()
  }, [extra, check])

  useEffect(() => {
    if (!dirty) return
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", avisar)
    return () => window.removeEventListener("beforeunload", avisar)
  }, [dirty])

  const markClean = useCallback(() => {
    inicial.current = foto()
    setDirty(false)
  }, [foto])

  return { dirty, check, markClean }
}
