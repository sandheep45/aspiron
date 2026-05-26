import { useTopicPerformanceQuery } from '@aspiron/tanstack-client'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardModule } from '@/features/dashboard/components/dashboard-module'
import { TableSkeleton } from '@/features/dashboard/components/dashboard-skeletons'
import { cn } from '@/lib/utils'

function getRecallBadge(strength: number | null | undefined) {
  if (strength == null) {
    return {
      label: '—',
      variant: 'outline' as const,
      className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    }
  }
  if (strength < 0.4) {
    return {
      label: 'Weak',
      variant: 'destructive' as const,
      className: '',
    }
  }
  if (strength < 0.7) {
    return {
      label: 'Medium',
      variant: 'outline' as const,
      className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    }
  }
  return {
    label: 'Strong',
    variant: 'outline' as const,
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

export function StudentPainPoints() {
  const topicQuery = useTopicPerformanceQuery({
    args: { sort_by: 'practice_accuracy', sort_order: 'asc', limit: 5 },
  })

  return (
    <DashboardModule
      title='Student Pain Points'
      sectionId='pain-points'
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
        <div
          data-testid='pain-point-table'
          className='overflow-hidden rounded-lg border border-slate-800'
        >
          <Table>
            <TableHeader>
              <TableRow className='border-slate-700/50 border-b hover:bg-transparent'>
                <TableHead className='w-60'>Topic</TableHead>
                <TableHead>Recall Strength</TableHead>
                <TableHead className='text-right'>Accuracy</TableHead>
                <TableHead className='text-right'>Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topics.map((topic) => {
                const badge = getRecallBadge(topic.recall_strength_mcq)
                return (
                  <TableRow key={topic.topic_id} data-testid='pain-point-row'>
                    <TableCell>
                      <p className='truncate font-medium text-sm text-white'>
                        {topic.topic_name}
                      </p>
                      <p className='truncate text-slate-400 text-xs'>
                        {topic.chapter_name} &middot; {topic.subject_name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={badge.variant}
                        className={cn(badge.className, 'shrink-0')}
                      >
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right text-slate-200 text-sm tabular-nums'>
                      {formatPercent(topic.practice_accuracy)}
                    </TableCell>
                    <TableCell className='text-right text-slate-400 text-sm tabular-nums'>
                      {String(topic.students_affected)}/
                      {String(topic.total_students)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    />
  )
}
