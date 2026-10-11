import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function MarcoCelular({
  children,
  width = 280,
  height = 580,
  className,
  pantallaClassName,
}: {
  children: ReactNode
  width?: number
  height?: number
  className?: string
  pantallaClassName?: string
}) {
  return (
    <div
      className={cn("relative rounded-celular bg-tinta p-[9px] shadow-celular", className)}
      style={{ width, height }}
    >
      <div className={cn("h-full w-full overflow-hidden rounded-[20px] bg-white", pantallaClassName)}>{children}</div>
    </div>
  )
}
