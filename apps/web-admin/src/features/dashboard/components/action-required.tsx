import { useInsightQuery } from '@aspiron/tanstack-client'
import { DashboardModule } from '@/features/dashboard/components/dashboard-module'
import { InsightSkeleton } from '@/features/dashboard/components/dashboard-skeletons'
import { InsightCard } from '@/features/dashboard/components/insight-card'

export function ActionRequired() {
  const insightQuery = useInsightQuery({ args: {} })

  return (
    <DashboardModule
      title='Action Required'
      sectionId='action-required'
      query={insightQuery}
      skeleton={<InsightSkeleton />}
      empty={{
        title: 'No items need attention right now',
        description: 'Everything looks healthy.',
      }}
      isEmpty={(data) => data.insights.length === 0}
      render={(data) => (
        <div className='grid grid-cols-2 gap-3'>
          {data.insights.map((insight) => (
            <InsightCard insight={insight} key={insight.id} />
          ))}
        </div>
      )}
    />
  )
}
