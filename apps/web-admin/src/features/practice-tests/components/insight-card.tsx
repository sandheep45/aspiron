import type { SignalType } from '@aspiron/api-client'
import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const insightVariants = cva(
  'flex items-start gap-3 rounded-2xl border bg-gradient-to-br p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
  {
    variants: {
      type: {
        positive:
          'border-emerald-500/20 from-emerald-900/10 to-emerald-900/5 [&>div]:bg-emerald-500/10 [&_svg]:text-emerald-400',
        warning:
          'border-amber-500/20 from-amber-900/10 to-amber-900/5 [&>div]:bg-amber-500/10 [&_svg]:text-amber-400',
        negative:
          'border-red-500/20 from-red-900/10 to-red-900/5 [&>div]:bg-red-500/10 [&_svg]:text-red-400',
        info: 'border-sky-500/20 from-sky-900/10 to-sky-900/5 [&>div]:bg-sky-500/10 [&_svg]:text-sky-400',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  },
)

const typeIcons: Record<string, LucideIcon> = {
  positive: CheckCircle,
  warning: AlertTriangle,
  negative: AlertCircle,
  info: Info,
}

interface InsightCardProps extends VariantProps<typeof insightVariants> {
  message: string
  signalType: SignalType
  className?: string
}

export function InsightCard({
  message,
  signalType,
  className,
}: InsightCardProps) {
  const Icon = typeIcons[signalType] ?? Info
  return (
    <div className={cn(insightVariants({ type: signalType, className }))}>
      <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg'>
        <Icon className='size-4' />
      </div>
      <p className='text-slate-300 text-xs leading-relaxed'>{message}</p>
    </div>
  )
}
