import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const iconContainerVariants = cva(
  'rounded-xl p-4 border transition-transform group-hover:scale-105',
  {
    variants: {
      variant: {
        danger:
          'bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20 text-rose-400',

        warning:
          'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400',

        success:
          'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 text-emerald-400',

        info: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-400',

        neutral:
          'bg-gradient-to-br from-slate-500/10 to-slate-600/10 border-slate-500/20 text-slate-400',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export type IconContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof iconContainerVariants>

export function IconContainer({
  className,
  variant,
  ...props
}: IconContainerProps) {
  return (
    <div
      className={cn(iconContainerVariants({ variant }), className)}
      {...props}
    />
  )
}
