import { useInsightQuery } from '@aspiron/tanstack-client'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardModule } from '@/features/dashboard/components/dashboard-module'
import { InsightSkeleton } from '@/features/dashboard/components/dashboard-skeletons'
import { InsightCard } from '@/features/dashboard/components/insight-card'

export function ActionRequired() {
  const insightQuery = useInsightQuery({
    args: { page: 1, limit: 5, sort_by: 'detected_at', sort_order: 'desc' },
  })

  return (
    <DashboardModule
      title='Action Required'
      sectionId='action-required'
      headerAction={
        <Button
          variant='ghost'
          className='h-8 gap-1.5 px-3 font-medium text-indigo-400 text-sm hover:text-indigo-300'
          nativeButton={false}
          render={<Link to='/insights' />}
        >
          View All
          <ArrowRight className='size-4' />
        </Button>
      }
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
