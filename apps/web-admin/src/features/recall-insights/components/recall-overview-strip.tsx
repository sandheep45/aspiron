import type { RecallOverview } from '@aspiron/api-client'
import { Brain, Clock, TrendingDown, Users } from 'lucide-react'
import { RecallOverviewSkeleton } from '@/features/recall-insights/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface RecallOverviewStripProps {
  data: RecallOverview | undefined
  loading?: boolean
  className?: string
}

const decayConfig: Record<string, { label: string; sentiment: string }> = {
  stable: { label: 'Stable', sentiment: 'positive' },
  degrading: { label: 'Degrading', sentiment: 'neutral' },
  critical: { label: 'Critical', sentiment: 'negative' },
}

function formatScore(value: number): string {
  return `${Math.round(value)}%`
}

export function RecallOverviewStrip({
  data,
  loading,
  className,
}: RecallOverviewStripProps) {
  if (loading) return <RecallOverviewSkeleton />

  if (!data) return null

  const metrics = [
    {
      icon: Brain,
      label: 'Average Recall Score',
      value: formatScore(data.avg_recall_score),
      hint: 'Overall memory retention',
    },
    {
      icon: Users,
      label: 'Students Completing Recall',
      value: formatScore(data.completion_rate),
      hint: 'Session completion rate',
    },
    {
      icon: TrendingDown,
      label: 'Memory Decay Trend',
      value: decayConfig[data.memory_decay]?.label ?? data.memory_decay,
      hint: 'Retention trajectory',
    },
    {
      icon: Clock,
      label: 'Last Recall Analysis',
      value: data.last_recall_run,
      hint: 'Most recent recall session',
    },
  ]

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <div
            key={metric.label}
            className='group flex flex-col gap-2 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:shadow-indigo-500/5 hover:shadow-lg'
          >
            <span className='font-medium text-[0.65rem] text-slate-400 uppercase tracking-wider'>
              {metric.label}
            </span>
            <span className='font-semibold text-2xl text-white tabular-nums tracking-tight'>
              {metric.value}
            </span>
            <div className='flex items-center gap-1.5 text-[0.65rem] text-slate-500'>
              <Icon className='size-3' />
              <span>{metric.hint}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
