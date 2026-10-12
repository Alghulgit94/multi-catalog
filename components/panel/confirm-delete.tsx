"use client"

import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

/** Botón de borrar con confirmación ("¿Eliminar…? No se puede deshacer."). */
export function ConfirmDelete({
  title,
  description,
  onConfirm,
  pending,
  label = "Eliminar",
}: {
  title: string
  description: React.ReactNode
  onConfirm: () => void
  pending?: boolean
  label?: string
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-texto-secundario hover:bg-error-fondo hover:text-destructive" aria-label={label}>
          <Trash2 className="size-4" strokeWidth={1.5} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-10 rounded-[12px] border-tinta font-semibold">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={pending}
            className="h-10 rounded-[12px] bg-destructive font-semibold text-white hover:bg-destructive/90"
          >
            {pending ? "Eliminando…" : label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
