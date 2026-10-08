"use client"

import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface BottomActionBarProps {
  isLast: boolean
  saveStatus: SaveStatus
  onSaveDraft: () => void
  onSaveAndNext: () => void
}

export function BottomActionBar({
  isLast,
  saveStatus,
  onSaveDraft,
  onSaveAndNext,
}: BottomActionBarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div
      className={cn(
        "fixed bottom-0 right-0 z-10 border-t border-border bg-white/95 backdrop-blur-sm transition-[left]",
        isCollapsed ? "left-16" : "left-64"
      )}
      style={{ transitionDuration: "var(--duration-base, 200ms)", transitionTimingFunction: "var(--ease-out, ease-out)" }}
    >
      <div className="flex items-center justify-between px-8 py-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === "saved" && (
            <>
              <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
              <span className="text-green-600">Cambios guardados</span>
            </>
          )}
          {saveStatus === "saving" && (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              <span>Guardando...</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
              <span className="text-red-600">Error al guardar</span>
            </>
          )}
          {saveStatus === "idle" && (
            <span className="text-xs">Sin cambios pendientes</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSaveDraft}
            disabled={saveStatus === "saving"}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            Guardar borrador
          </button>
          <button
            onClick={onSaveAndNext}
            disabled={saveStatus === "saving"}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLast ? "Guardar y finalizar" : "Guardar y siguiente producto"}
          </button>
        </div>
      </div>
    </div>
  )
}
