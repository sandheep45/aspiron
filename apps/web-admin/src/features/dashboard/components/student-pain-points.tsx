import type { TopicPerformance } from '@aspiron/api-client'
import { useTopicPerformanceQuery } from '@aspiron/tanstack-client'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { DashboardModule } from '@/features/dashboard/components/dashboard-module'
import { TableSkeleton } from '@/features/dashboard/components/dashboard-skeletons'
import { cn } from '@/lib/utils'

function getRecallBadge(strength: number | null | undefined) {
  if (strength == null) {
    return {
      label: '—',
      variant: 'outline' as const,
      className:
        'rounded-md bg-slate-500/15 text-slate-400 border-slate-500/30',
    }
  }
  if (strength < 0.4) {
    return {
      label: 'Weak',
      variant: 'destructive' as const,
      className: 'rounded-md',
    }
  }
  if (strength < 0.7) {
    return {
      label: 'Medium',
      variant: 'outline' as const,
      className:
        'rounded-md bg-amber-500/15 text-amber-400 border-amber-500/30',
    }
  }
  return {
    label: 'Strong',
    variant: 'outline' as const,
    className:
      'rounded-md bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

const columns: ColumnDef<TopicPerformance>[] = [
  {
    accessorKey: 'topic_name',
    header: 'Topic',
    cell: ({ row }) => {
      const topic = row.original
      return (
        <div>
          <p className='truncate font-medium text-sm text-white'>
            {topic.topic_name}
          </p>
          <p className='truncate text-slate-400 text-xs'>
            {topic.chapter_name} &middot; {topic.subject_name}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'recall_strength_mcq',
    header: () => <div className='text-center'>Recall Strength</div>,
    cell: ({ row }) => {
      const badge = getRecallBadge(
        row.getValue<number | null>('recall_strength_mcq'),
      )
      return (
        <div className='flex justify-center'>
          <Badge
            variant={badge.variant}
            className={cn(badge.className, 'shrink-0')}
          >
            {badge.label}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'practice_accuracy',
    header: () => <div className='text-center'>Accuracy</div>,
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <span className='text-slate-200 text-sm tabular-nums'>
          {formatPercent(row.getValue<number>('practice_accuracy'))}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'students_affected',
    header: () => <div className='text-center'>Students</div>,
    cell: ({ row }) => {
      const topic = row.original
      return (
        <div className='flex justify-center'>
          <span className='text-slate-400 text-sm tabular-nums'>
            {String(topic.students_affected)}/{String(topic.total_students)}
          </span>
        </div>
      )
    },
  },
]

export function StudentPainPoints() {
  const topicQuery = useTopicPerformanceQuery({
    args: { sort_by: 'practice_accuracy', sort_order: 'asc', limit: 5 },
  })

  return (
    <DashboardModule
      title='Student Pain Points'
      sectionId='pain-points'
      sectionAccent='bg-rose-500'
      headerAction={
        <Button
          variant='ghost'
          className='h-8 gap-1.5 px-3 font-medium text-indigo-400 text-sm hover:text-indigo-300'
          nativeButton={false}
          render={<Link to='/pain-points' />}
        >
          View All
          <ArrowRight className='size-4' />
        </Button>
      }
      query={topicQuery}
      skeleton={<TableSkeleton />}
      empty={{
        title: 'No topic data available yet',
        description: 'Data appears once students complete recall sessions.',
      }}
      isEmpty={(data) => data.topics.length === 0}
      render={(data) => (
        <DataTable
          columns={columns}
          data={data.topics}
          className='bg-card ring-1 ring-foreground/10'
          getRowProps={() =>
            ({
              'data-testid': 'pain-point-row',
            }) as React.HTMLAttributes<HTMLElement>
          }
        />
      )}
    />
  )
}
