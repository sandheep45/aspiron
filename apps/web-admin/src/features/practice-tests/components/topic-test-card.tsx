import type { TopicTestItem } from '@aspiron/api-client'
import { cva } from 'class-variance-authority'
import { Copy, Eye, FileBarChart, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const testStatusVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-[0.65rem]',
  {
    variants: {
      status: {
        published: 'bg-emerald-500/10 text-emerald-400 [&>span]:bg-emerald-500',
        draft: 'bg-slate-500/10 text-slate-400 [&>span]:bg-slate-500',
        archived: 'bg-red-500/10 text-red-400 [&>span]:bg-red-500',
      },
    },
    defaultVariants: {
      status: 'draft',
    },
  },
)

interface TopicTestCardProps {
  test: TopicTestItem
  className?: string
}

function MetricValue({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className='flex flex-col items-center gap-0.5'>
      <span className='font-semibold text-sm text-white tabular-nums'>
        {value}
      </span>
      <span className='text-[0.6rem] text-slate-500 uppercase tracking-wider'>
        {label}
      </span>
    </div>
  )
}

export function TopicTestCard({ test, className }: TopicTestCardProps) {
  const statusVariant = test.status.toLowerCase() as
    | 'published'
    | 'draft'
    | 'archived'

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:shadow-indigo-500/5 hover:shadow-lg sm:flex-row sm:items-center',
        className,
      )}
    >
      {/* Title + Status */}
      <div className='flex flex-col gap-1.5 sm:min-w-[200px] sm:flex-1'>
        <h3 className='truncate font-semibold text-sm text-white'>
          {test.title}
        </h3>
        <span className={cn(testStatusVariants({ status: statusVariant }))}>
          <span className='h-1.5 w-1.5 rounded-full' />
          {test.status}
        </span>
      </div>

      {/* Metrics */}
      <div className='flex flex-wrap gap-4 sm:gap-6'>
        <MetricValue label='Questions' value={test.questions_count} />
        <MetricValue label='Difficulty' value={test.difficulty_mix} />
        <MetricValue
          label='Avg Score'
          value={
            test.average_score !== null && test.average_score !== undefined
              ? `${Math.round(test.average_score)}%`
              : '\u2014'
          }
        />
        <MetricValue label='Attempts' value={test.attempts} />
      </div>

      {/* Actions */}
      <div className='flex items-center gap-1 sm:shrink-0'>
        <Button
          variant='ghost'
          size='icon-sm'
          className='text-slate-500 hover:text-white'
        >
          <Eye className='size-3.5' />
        </Button>
        <Button
          variant='ghost'
          size='icon-sm'
          className='text-slate-500 hover:text-white'
        >
          <Pencil className='size-3.5' />
        </Button>
        <Button
          variant='ghost'
          size='icon-sm'
          className='text-slate-500 hover:text-white'
        >
          <Copy className='size-3.5' />
        </Button>
        <Button
          variant='ghost'
          size='icon-sm'
          className='text-slate-500 hover:text-white'
        >
          <FileBarChart className='size-3.5' />
        </Button>
      </div>
    </div>
  )
}
