"use client"

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface BottomActionBarProps {
  isLast: boolean
  saveStatus: SaveStatus
  dirty: boolean
  onSaveDraft: () => void
  onSaveAndNext: () => void
}

/** Barra de acciones del gestor de fotos: queda pegada abajo mientras se scrollea. */
export function BottomActionBar({ isLast, saveStatus, dirty, onSaveDraft, onSaveAndNext }: BottomActionBarProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-linea bg-white/95 px-4 py-3 backdrop-blur-sm sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm" aria-live="polite">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="size-4 animate-spin text-texto-secundario" />
              <span className="text-texto-secundario">Guardando…</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle2 className="size-4 text-exito" strokeWidth={1.75} />
              <span className="font-medium text-[#1e6e49]">Cambios guardados</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <AlertCircle className="size-4 text-destructive" strokeWidth={1.75} />
              <span className="font-medium text-destructive">No se pudo guardar</span>
            </>
          )}
          {saveStatus === "idle" && (
            <span className="text-texto-secundario">{dirty ? "Tenés cambios sin guardar" : "Sin cambios pendientes"}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSaveDraft} disabled={saveStatus === "saving" || !dirty}>
            Guardar
          </Button>
          <Button onClick={onSaveAndNext} disabled={saveStatus === "saving"}>
            {isLast ? "Guardar y terminar" : "Guardar y seguir"}
          </Button>
        </div>
      </div>
    </div>
  )
}
