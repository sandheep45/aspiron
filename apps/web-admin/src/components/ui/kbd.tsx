import type * as React from 'react'
import { cn } from '@/lib/utils'

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot='kbd'
      className={cn(
        'inline-flex items-center justify-center rounded-[calc(var(--radius-sm)-2px)] border bg-muted px-1.5 py-0.5 font-medium font-mono text-[0.625rem] text-muted-foreground shadow-xs',
        className,
      )}
      {...props}
    />
  )
}

export { Kbd }
