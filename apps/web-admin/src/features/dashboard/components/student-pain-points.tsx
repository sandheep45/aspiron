import { useTopicPerformanceQuery } from '@aspiron/tanstack-client'
import { Badge } from '@/components/ui/badge'
import { DashboardModule } from '@/features/dashboard/components/dashboard-module'
import { TableSkeleton } from '@/features/dashboard/components/dashboard-skeletons'

function getStatusBadge(accuracy: number) {
  if (accuracy < 0.4) {
    return { label: 'Weak', variant: 'destructive' as const }
  }
  if (accuracy < 0.7) {
    return { label: 'Medium', variant: 'secondary' as const }
  }
  return { label: 'Strong', variant: 'default' as const }
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

export function StudentPainPoints() {
  const topicQuery = useTopicPerformanceQuery({
    args: { sort_by: 'practice_accuracy', sort_order: 'asc', limit: 10 },
  })

  return (
    <DashboardModule
      title='Student Pain Points'
      sectionId='pain-points'
      query={topicQuery}
      skeleton={<TableSkeleton />}
      empty={{
        title: 'No topic data available yet',
        description: 'Data appears once students complete recall sessions.',
      }}
      isEmpty={(data) => data.topics.length === 0}
      render={(data) => (
        <div data-testid='pain-point-table' className='space-y-2'>
          {data.topics.map((topic) => {
            const badge = getStatusBadge(topic.practice_accuracy)
            return (
              <div
                key={topic.topic_id}
                className='flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/30 p-4'
              >
                <div className='flex min-w-0 flex-1 items-center gap-4'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-medium text-white'>
                      {topic.topic_name}
                    </p>
                    <p className='truncate text-slate-400 text-sm'>
                      {topic.chapter_name} &middot; {topic.subject_name}
                    </p>
                  </div>
                  <div className='hidden items-center gap-4 text-right md:flex'>
                    <div className='w-16'>
                      <p className='text-slate-500 text-sm'>Recall</p>
                      <p className='font-medium text-slate-200'>
                        {topic.recall_strength_mcq != null
                          ? formatPercent(topic.recall_strength_mcq)
                          : '—'}
                      </p>
                    </div>
                    <div className='w-16'>
                      <p className='text-slate-500 text-sm'>Accuracy</p>
                      <p className='font-medium text-slate-200'>
                        {formatPercent(topic.practice_accuracy)}
                      </p>
                    </div>
                    <div className='w-20'>
                      <p className='text-slate-500 text-sm'>Students</p>
                      <p className='font-medium text-slate-200'>
                        {String(topic.students_affected)}/
                        {String(topic.total_students)}
                      </p>
                    </div>
                  </div>
                </div>
                <Badge variant={badge.variant} className='ml-3 shrink-0'>
                  {badge.label}
                </Badge>
              </div>
            )
          })}
        </div>
      )}
    />
  )
}
