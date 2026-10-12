import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Botones Katalo: primario (azul lleno) o secundario (borde tinta), radio 12,
// sin sombra. El foco lo da el outline de marca (.katalo-app :focus-visible).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] font-cuerpo text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:stroke-[1.75] shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primario text-white hover:bg-primario-hover',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline: 'border border-tinta bg-white text-tinta hover:bg-fondo-alterno',
        secondary: 'bg-fondo-alterno text-tinta hover:bg-linea/70',
        ghost: 'text-tinta hover:bg-fondo-alterno',
        link: 'text-primario underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 has-[>svg]:px-3.5',
        sm: 'h-8 gap-1.5 rounded-[10px] px-3 text-[13px] has-[>svg]:px-2.5',
        lg: 'h-12 px-6 text-base has-[>svg]:px-5',
        icon: 'size-10',
        'icon-sm': 'size-8 rounded-[10px]',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
