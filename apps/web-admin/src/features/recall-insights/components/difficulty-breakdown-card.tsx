import type { DifficultyBreakdownItem } from '@aspiron/api-client'
import { DifficultyBreakdownSkeleton } from '@/features/recall-insights/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface DifficultyBreakdownCardProps {
  items: DifficultyBreakdownItem[] | undefined
  loading?: boolean
  className?: string
}

const difficultyStyles: Record<
  string,
  { bg: string; text: string; bar: string }
> = {
  Easy: {
    bg: 'from-emerald-900/20 to-emerald-900/5',
    text: 'text-emerald-300',
    bar: 'bg-emerald-500',
  },
  Medium: {
    bg: 'from-amber-900/20 to-amber-900/5',
    text: 'text-amber-300',
    bar: 'bg-amber-500',
  },
  Hard: {
    bg: 'from-red-900/20 to-red-900/5',
    text: 'text-red-300',
    bar: 'bg-red-500',
  },
}

const defaultStyle = {
  bg: 'from-slate-900/90 to-slate-900/50',
  text: 'text-white',
  bar: 'bg-indigo-500',
}

export function DifficultyBreakdownCard({
  items,
  loading,
  className,
}: DifficultyBreakdownCardProps) {
  if (loading) return <DifficultyBreakdownSkeleton />

  if (!items || items.length === 0) return null

  return (
    <div className={cn('grid gap-3 sm:grid-cols-3', className)}>
      {items.map((item) => {
        const style = difficultyStyles[item.difficulty] ?? defaultStyle
        return (
          <div
            key={item.difficulty}
            className={cn(
              'flex flex-col gap-3 rounded-2xl border border-white/5 bg-gradient-to-br p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5',
              style.bg,
            )}
          >
            <div className='flex items-center justify-between'>
              <span className={cn('font-semibold text-sm', style.text)}>
                {item.difficulty}
              </span>
              <span className='text-slate-500 text-xs'>
                {item.count} question{item.count !== 1 ? 's' : ''}
              </span>
            </div>
            <span
              className={cn(
                'font-bold text-3xl tabular-nums tracking-tight',
                style.text,
              )}
            >
              {Math.round(item.accuracy)}%
            </span>
            <div className='flex flex-col gap-1'>
              <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-800'>
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    style.bar,
                  )}
                  style={{ width: `${Math.min(item.accuracy, 100)}%` }}
                />
              </div>
              <span className='text-[0.65rem] text-slate-500'>
                Recall Accuracy
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
