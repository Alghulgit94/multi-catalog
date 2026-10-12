import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-linea placeholder:text-texto-secundario/70 focus-visible:border-primario aria-invalid:border-destructive flex field-sizing-content min-h-20 w-full rounded-[10px] border bg-white px-3 py-2.5 text-[15px] text-tinta transition-colors outline-none hover:border-texto-secundario/50 disabled:cursor-not-allowed disabled:bg-fondo-alterno disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
