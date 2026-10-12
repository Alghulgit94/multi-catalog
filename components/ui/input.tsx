import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-texto-secundario/70 selection:bg-primario selection:text-white border-linea h-10 w-full min-w-0 rounded-[10px] border bg-white px-3 py-1 text-[15px] text-tinta transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-texto-secundario/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-fondo-alterno disabled:opacity-60',
        'focus-visible:border-primario',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
