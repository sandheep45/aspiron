import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusVariants = cva(
  'inline-flex rounded-md px-2 py-0.5 font-medium text-[0.65rem]',
  {
    variants: {
      status: {
        active: 'bg-emerald-500/10 text-emerald-400',
        draft: 'bg-slate-500/10 text-slate-400',
        archived: 'bg-red-500/10 text-red-400',
      },
    },
    defaultVariants: {
      status: 'draft',
    },
  },
)

interface QuestionStatusBadgeProps extends VariantProps<typeof statusVariants> {
  status: string
  className?: string
}

export function QuestionStatusBadge({
  status,
  className,
}: QuestionStatusBadgeProps) {
  const variant = status.toLowerCase() as 'active' | 'draft' | 'archived'
  return (
    <span className={cn(statusVariants({ status: variant, className }))}>
      {status}
    </span>
  )
}
