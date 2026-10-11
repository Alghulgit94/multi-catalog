import Image from "next/image"

type LogoVariante = "sello" | "horizontal" | "horizontal-blanco" | "sello-invertido"

const ARCHIVOS: Record<LogoVariante, string> = {
  sello: "/brand/katalo-sello.svg",
  "sello-invertido": "/brand/katalo-sello-invertido.svg",
  horizontal: "/brand/katalo-horizontal.svg",
  "horizontal-blanco": "/brand/katalo-horizontal-blanco.svg",
}

const DIMENSIONES: Record<LogoVariante, { width: number; height: number }> = {
  sello: { width: 100, height: 100 },
  "sello-invertido": { width: 100, height: 100 },
  horizontal: { width: 332, height: 100 },
  "horizontal-blanco": { width: 332, height: 100 },
}

export function LogoKatalo({
  variant,
  className,
  height = 30,
}: {
  variant: LogoVariante
  className?: string
  height?: number
}) {
  const { width, height: alturaBase } = DIMENSIONES[variant]
  return (
    <Image
      src={ARCHIVOS[variant]}
      alt="Katalo"
      width={width}
      height={alturaBase}
      style={{ height, width: "auto" }}
      className={className}
      priority
    />
  )
}
