import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { ReactElement } from 'react'

interface InsightCardProps {
  type: string
  title: string
  description: string
}

const typeConfig: Record<
  string,
  { icon: ReactElement; border: string; bg: string; iconBg: string }
> = {
  positive: {
    icon: <CheckCircle2 className='size-4' />,
    border: 'border-emerald-900/30',
    bg: 'from-emerald-950/20 to-transparent',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
  },
  warning: {
    icon: <AlertTriangle className='size-4' />,
    border: 'border-amber-900/30',
    bg: 'from-amber-950/20 to-transparent',
    iconBg: 'bg-amber-500/10 text-amber-400',
  },
  negative: {
    icon: <AlertCircle className='size-4' />,
    border: 'border-red-900/30',
    bg: 'from-red-950/20 to-transparent',
    iconBg: 'bg-red-500/10 text-red-400',
  },
  info: {
    icon: <Info className='size-4' />,
    border: 'border-blue-900/30',
    bg: 'from-blue-950/20 to-transparent',
    iconBg: 'bg-blue-500/10 text-blue-400',
  },
}

export function InsightCard({ type, title, description }: InsightCardProps) {
  const config = typeConfig[type] ?? typeConfig.info

  return (
    <div
      className={`rounded-xl border ${config.border} bg-gradient-to-br ${config.bg} to-slate-900/40 p-4 backdrop-blur-sm`}
    >
      <div className='mb-3 flex items-center gap-3'>
        <div
          className={`flex size-8 items-center justify-center rounded-lg ${config.iconBg}`}
        >
          {config.icon}
        </div>
        <p className='font-medium text-slate-200 text-sm'>{title}</p>
      </div>
      <p className='text-slate-400 text-xs leading-relaxed'>{description}</p>
    </div>
  )
}
