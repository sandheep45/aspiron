import type { TopicDetailResponse } from '@aspiron/api-client'
import {
  AlertTriangle,
  type BookOpen,
  Lightbulb,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { TopicDetailSkeleton } from '@/features/insights/components/student-pain-points/loading-skeleton'
import { cn } from '@/lib/utils'

interface TopicDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data?: TopicDetailResponse
  isLoading: boolean
}

function accuracyColor(accuracy: number) {
  if (accuracy < 0.4) return 'text-red-400'
  if (accuracy < 0.7) return 'text-amber-400'
  return 'text-emerald-400'
}

function accuracyBg(accuracy: number) {
  if (accuracy < 0.4) return 'bg-red-500/10 border-red-500/20'
  if (accuracy < 0.7) return 'bg-amber-500/10 border-amber-500/20'
  return 'bg-emerald-500/10 border-emerald-500/20'
}

function trendIcon(trend: string) {
  switch (trend) {
    case 'degrading':
      return <TrendingDown className='size-4 text-red-400' />
    case 'improving':
      return <TrendingUp className='size-4 text-emerald-400' />
    default:
      return <TrendingUp className='size-4 text-slate-400' />
  }
}

function trendBadge(trend: string) {
  switch (trend) {
    case 'degrading':
      return 'bg-orange-500/15 text-orange-400 border-orange-500/30'
    case 'stable':
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
    case 'improving':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    default:
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  }
}

export function TopicDetailDrawer({
  open,
  onOpenChange,
  data,
  isLoading,
}: TopicDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full border-slate-800/50 border-l bg-slate-950 sm:max-w-lg'
        showCloseButton
      >
        {isLoading ? (
          <TopicDetailSkeleton />
        ) : data ? (
          <div className='flex h-full flex-col'>
            <SheetHeader className='border-slate-800/50 border-b px-6 pb-5'>
              <div className='flex items-start justify-between'>
                <div className='flex flex-col gap-1'>
                  <SheetTitle className='font-semibold text-base text-white'>
                    {data.topic}
                  </SheetTitle>
                  <SheetDescription className='text-slate-400 text-xs'>
                    Topic Performance Details
                  </SheetDescription>
                </div>
              </div>

              <div className='mt-4 flex items-center gap-4'>
                <div
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border px-4 py-2.5',
                    accuracyBg(data.accuracy),
                  )}
                >
                  <span
                    className={cn(
                      'font-bold text-lg tabular-nums',
                      accuracyColor(data.accuracy),
                    )}
                  >
                    {Math.round(data.accuracy * 100)}%
                  </span>
                  <span className='text-[0.6rem] text-slate-500 uppercase tracking-wider'>
                    Accuracy
                  </span>
                </div>

                <div className='flex flex-col items-center gap-1 rounded-xl border border-slate-800/50 bg-slate-900/30 px-4 py-2.5'>
                  <div className='flex items-center gap-1.5'>
                    <Users className='size-4 text-slate-400' />
                    <span className='font-bold text-lg text-slate-200 tabular-nums'>
                      {Number(data.students_affected)}
                    </span>
                  </div>
                  <span className='text-[0.6rem] text-slate-500 uppercase tracking-wider'>
                    Students
                  </span>
                </div>

                <div className='flex flex-col items-center gap-1 rounded-xl border border-slate-800/50 bg-slate-900/30 px-4 py-2.5'>
                  <div className='flex items-center gap-1.5'>
                    {trendIcon(data.trend)}
                    <Badge
                      variant='outline'
                      className={cn(
                        'rounded-full border px-2 py-0.5 font-semibold text-[0.6rem]',
                        trendBadge(data.trend),
                      )}
                    >
                      {data.trend}
                    </Badge>
                  </div>
                  <span className='text-[0.6rem] text-slate-500 uppercase tracking-wider'>
                    Trend
                  </span>
                </div>
              </div>
            </SheetHeader>

            <div className='flex-1 overflow-y-auto px-6 py-5'>
              <div className='flex flex-col gap-6'>
                <Section
                  icon={AlertTriangle}
                  title='Common Mistakes'
                  items={data.common_mistakes}
                  emptyText='No common mistakes recorded'
                  iconClass='text-red-400'
                  bgClass='bg-red-500/10'
                />

                <Section
                  icon={Target}
                  title='Weak Questions'
                  items={data.weak_questions}
                  emptyText='No weak questions identified'
                  iconClass='text-amber-400'
                  bgClass='bg-amber-500/10'
                />

                <Section
                  icon={Lightbulb}
                  title='Recommendations'
                  items={data.recommendations}
                  emptyText='No recommendations available'
                  iconClass='text-indigo-400'
                  bgClass='bg-indigo-500/10'
                />
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Section({
  icon: Icon,
  title,
  items,
  emptyText,
  iconClass,
  bgClass,
}: {
  icon: typeof BookOpen
  title: string
  items: string[]
  emptyText: string
  iconClass: string
  bgClass: string
}) {
  return (
    <div>
      <div className='mb-2.5 flex items-center gap-2'>
        <div
          className={cn(
            'flex size-6 items-center justify-center rounded-md',
            bgClass,
          )}
        >
          <Icon className={cn('size-3.5', iconClass)} />
        </div>
        <h3 className='font-medium text-slate-300 text-xs uppercase tracking-wider'>
          {title}
        </h3>
      </div>

      {items.length > 0 ? (
        <div className='flex flex-wrap gap-2'>
          {items.map((item, i) => (
            <div
              key={i}
              className='rounded-lg border border-slate-800/40 bg-slate-900/40 px-3 py-1.5 text-slate-300 text-xs transition-colors hover:border-slate-700/60 hover:bg-slate-900/60'
            >
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className='text-slate-500 text-xs italic'>{emptyText}</p>
      )}
    </div>
  )
}
