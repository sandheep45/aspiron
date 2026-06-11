import type { PracticeOverview } from '@aspiron/api-client'
import type { LucideIcon } from 'lucide-react'
import { ClipboardList, FileQuestion, Target, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PracticeOverviewCardProps {
  data: PracticeOverview | undefined
  loading?: boolean
  className?: string
}

const metrics: Array<{
  key: keyof PracticeOverview
  icon: LucideIcon
  label: string
  formatter: (value: PracticeOverview[keyof PracticeOverview]) => string
  formatValue: boolean
}> = [
  {
    key: 'total_questions',
    icon: FileQuestion,
    label: 'Total Practice Questions',
    formatter: (v) => String(v),
    formatValue: false,
  },
  {
    key: 'average_accuracy',
    icon: Target,
    label: 'Average Practice Accuracy',
    formatter: (v) => `${v}%`,
    formatValue: false,
  },
  {
    key: 'total_tests',
    icon: ClipboardList,
    label: 'Total Topic Tests',
    formatter: (v) => String(v),
    formatValue: false,
  },
  {
    key: 'last_test_conducted',
    icon: Timer,
    label: 'Last Test Conducted',
    formatter: (v) => String(v),
    formatValue: false,
  },
]

function MetricSkeleton() {
  return (
    <div className='flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/50 p-4'>
      <div className='h-3 w-28 animate-pulse rounded bg-slate-800' />
      <div className='h-6 w-16 animate-pulse rounded bg-slate-800' />
      <div className='h-3 w-20 animate-pulse rounded bg-slate-800' />
    </div>
  )
}

export function PracticeOverviewCard({
  data,
  loading,
  className,
}: PracticeOverviewCardProps) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
        : metrics.map((metric) => {
            const value = data?.[metric.key]
            const Icon = metric.icon
            const displayValue =
              value !== undefined && value !== null
                ? metric.formatter(value)
                : '\u2014'
            return (
              <div
                key={metric.key}
                className='group flex flex-col gap-2 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:shadow-indigo-500/5 hover:shadow-lg'
              >
                <span className='font-medium text-[0.65rem] text-slate-400 uppercase tracking-wider'>
                  {metric.label}
                </span>
                <span className='font-semibold text-2xl text-white tabular-nums tracking-tight'>
                  {displayValue}
                </span>
                <div className='flex items-center gap-1.5 text-[0.65rem] text-slate-500'>
                  <Icon className='size-3' />
                  <span>Practice overview</span>
                </div>
              </div>
            )
          })}
    </div>
  )
}
