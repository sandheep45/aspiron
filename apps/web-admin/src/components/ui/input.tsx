import { Input as InputPrimitive } from '@base-ui/react/input'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  // Base classes that apply to all variants
  `
    w-full outline-none transition-all min-w-0 px-2 h-9
    file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-xs/relaxed
    disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
    aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20
    focus-visible:ring-2 focus-visible:ring-ring/30
    md:text-xs/relaxed
    dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40
  `,
  {
    variants: {
      variant: {
        default: `
          rounded-md
          border border-input
          bg-input/20
          placeholder:text-muted-foreground
          focus-visible:border-ring
          dark:bg-input/30
        `,
        form: `
          rounded-lg
          border border-slate-700/50
          bg-slate-800/50
          text-slate-200
          placeholder:text-slate-500
          focus:border-indigo-500/50 focus:ring-indigo-500/50
        `,
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type InputVariantProps = VariantProps<typeof inputVariants>
type InputProps = React.ComponentProps<'input'> & InputVariantProps

function Input({ className, variant, type = 'text', ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot='input'
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Input, type InputProps, type InputVariantProps }
