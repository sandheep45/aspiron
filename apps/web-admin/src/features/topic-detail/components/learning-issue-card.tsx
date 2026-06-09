import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SeverityBadge } from '@/features/topic-detail/components/severity-badge'
import { cn } from '@/lib/utils'

interface LearningIssueCardProps {
  title: string
  severity: string
  description: string
  recommendation: string
  actionLabel: string
  variant?: 'default' | 'success'
  className?: string
}

const severityIcons = {
  critical: ShieldAlert,
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
}

const defaultIcon = AlertCircle

const severityBorderColors: Record<string, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-500',
  low: 'border-l-emerald-500',
}

export function LearningIssueCard({
  title,
  severity,
  description,
  recommendation,
  actionLabel,
  variant = 'default',
  className,
}: LearningIssueCardProps) {
  const isSuccess = variant === 'success'

  if (isSuccess) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
          'border-[rgba(0,208,132,0.15)] shadow-[0_0_12px_-4px_rgba(0,208,132,0.12)]',
          'h-[160px]',
          className,
        )}
      >
        <div className='flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400'>
          <CheckCircle className='size-6' />
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <h3 className='font-semibold text-lg text-white leading-tight'>
            {title}
          </h3>
          <p className='line-clamp-2 text-slate-400 text-xs leading-relaxed'>
            {description}
          </p>
          <div className='mt-0.5 flex flex-wrap items-center gap-2'>
            <p className='text-slate-500 text-xs'>
              <span className='font-medium text-slate-400'>
                Recommendation:{' '}
              </span>
              {recommendation}
            </p>
            <SeverityBadge severity={severity} />
            <Button
              variant='brand'
              size='sm'
              className='h-7 font-medium text-xs'
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const Icon =
    severityIcons[severity as keyof typeof severityIcons] ?? defaultIcon
  const borderColor = severityBorderColors[severity] ?? 'border-l-slate-500'

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-2xl border border-white/5 border-l-4 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-lg',
        borderColor,
        className,
      )}
    >
      <div className='mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-800/50'>
        <Icon className='size-5 text-slate-400' />
      </div>

      <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
        <h3 className='font-semibold text-sm text-white'>{title}</h3>
        <p className='text-slate-400 text-xs leading-relaxed'>{description}</p>
        <p className='text-slate-500 text-xs italic'>
          <span className='font-medium text-slate-400 not-italic'>
            Recommendation:{' '}
          </span>
          {recommendation}
        </p>
      </div>

      <div className='flex shrink-0 flex-col items-end gap-3'>
        <SeverityBadge severity={severity} />
        <Button variant='outline' size='sm' className='h-8 text-xs'>
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}
