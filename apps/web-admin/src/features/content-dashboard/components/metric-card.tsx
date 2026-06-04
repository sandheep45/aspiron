import type { LucideIcon } from 'lucide-react'
import { MetricCardSkeleton } from '@/features/content-dashboard/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  icon: LucideIcon
  title: string
  value: number
  supportingText: string
  loading?: boolean
  className?: string
}

export function MetricCard({
  icon: Icon,
  title,
  value,
  supportingText,
  loading,
  className,
}: MetricCardProps) {
  if (loading) {
    return <MetricCardSkeleton />
  }

  return (
    <div
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:shadow-indigo-500/5 hover:shadow-lg',
        className,
      )}
    >
      <div className='flex items-center justify-between'>
        <span className='font-medium text-slate-400 text-xs uppercase tracking-wide'>
          {title}
        </span>
        <div className='flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-500/20'>
          <Icon className='size-4' />
        </div>
      </div>
      <span className='font-semibold text-3xl text-white tabular-nums tracking-tight'>
        {value}
      </span>
      <span className='text-slate-500 text-xs'>{supportingText}</span>
    </div>
  )
}
