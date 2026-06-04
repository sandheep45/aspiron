import type { ContentDashboardSignalItem } from '@aspiron/api-client'
import type { LucideIcon } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SignalCardProps {
  title: string
  description: string
  icon: LucideIcon
  items: ContentDashboardSignalItem[]
  valueKey: 'score' | 'drop'
  loading?: boolean
}

function SignalCardSkeleton() {
  return (
    <div className='flex h-[260px] flex-col rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 backdrop-blur-sm'>
      <div className='shrink-0'>
        <div className='mb-4 flex items-center gap-2.5'>
          <div className='size-5 animate-pulse rounded-lg bg-slate-800' />
          <div className='h-4 w-48 animate-pulse rounded bg-slate-800' />
        </div>
        <div className='mb-4 h-3 w-36 animate-pulse rounded bg-slate-800' />
      </div>
      <ScrollArea className='flex-1'>
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className='flex items-center justify-between'>
              <div className='h-4 w-48 animate-pulse rounded bg-slate-800' />
              <div className='h-4 w-12 animate-pulse rounded bg-slate-800' />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export function SignalCard({
  title,
  description,
  icon: Icon,
  items,
  valueKey,
  loading,
}: SignalCardProps) {
  if (loading) return <SignalCardSkeleton />

  const isDecay = valueKey === 'drop'

  return (
    <div className='flex h-[260px] flex-col rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:shadow-indigo-500/5 hover:shadow-lg'>
      <div className='shrink-0'>
        <div className='mb-3 flex items-center gap-2.5'>
          <div
            className={`flex size-7 items-center justify-center rounded-lg ${
              isDecay
                ? 'bg-red-500/10 text-red-400'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            <Icon className='size-4' />
          </div>
          <h3 className='font-semibold text-[1.125rem] text-white'>{title}</h3>
        </div>

        <p className='mb-3 text-[0.75rem] text-slate-500'>{description}</p>
      </div>

      {items.length === 0 ? (
        <p className='py-4 text-center text-slate-500 text-xs'>
          No signals available.
        </p>
      ) : (
        <ScrollArea className='min-h-0 flex-1'>
          <div className='space-y-2'>
            {items.map((item) => (
              <div
                key={item.topic}
                className='flex items-center justify-between gap-2'
              >
                <span className='min-w-0 truncate font-medium text-[0.875rem] text-slate-200'>
                  {item.topic}
                </span>
                <span
                  className={`shrink-0 whitespace-nowrap text-[0.8125rem] ${
                    isDecay ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {isDecay
                    ? `${Math.round(item.drop ?? 0)}% drop`
                    : `${Math.round(item.score ?? 0)}% recall`}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
