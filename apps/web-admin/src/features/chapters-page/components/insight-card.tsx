import type { LucideIcon } from 'lucide-react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsightCardProps {
  type: string
  title: string
  description: string
}

const typeConfig: Record<
  string,
  { icon: LucideIcon; border: string; bg: string; iconBg: string }
> = {
  positive: {
    icon: CheckCircle2,
    border: 'border-emerald-500/20',
    bg: 'from-emerald-500/5',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/20',
    bg: 'from-amber-500/5',
    iconBg: 'bg-amber-500/15 text-amber-400',
  },
  negative: {
    icon: AlertCircle,
    border: 'border-red-500/20',
    bg: 'from-red-500/5',
    iconBg: 'bg-red-500/15 text-red-400',
  },
  info: {
    icon: Info,
    border: 'border-blue-500/20',
    bg: 'from-blue-500/5',
    iconBg: 'bg-blue-500/15 text-blue-400',
  },
}

export function InsightCard({ type, title, description }: InsightCardProps) {
  const config = typeConfig[type] || typeConfig.info
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-gradient-to-br to-slate-900/50 p-5 backdrop-blur-sm',
        config.border,
        config.bg,
      )}
    >
      <div className='flex items-center gap-2.5'>
        <div
          className={cn(
            'flex size-7 items-center justify-center rounded-lg',
            config.iconBg,
          )}
        >
          <Icon className='size-4' />
        </div>
        <h3 className='font-medium text-slate-200 text-sm'>{title}</h3>
      </div>
      <p className='text-slate-400 text-xs leading-relaxed'>{description}</p>
    </div>
  )
}
