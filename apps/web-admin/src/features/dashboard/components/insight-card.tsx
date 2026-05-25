import type {
  Insight,
  InsightMetadataMap,
  InsightType,
} from '@aspiron/api-client'
import { useGetTopicByIdQuery } from '@aspiron/tanstack-client'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IconContainer, severityVariants } from '@/components/ui/icon-container'
import { dashboardQuickActionRouteMapper } from '@/features/dashboard/utils'
import { cn } from '@/lib/utils'

interface InsightCardProps {
  insight: Insight
}

export function InsightCard({ insight }: InsightCardProps) {
  const { icon: InsightIcon } =
    dashboardQuickActionRouteMapper[insight.insight_type as InsightType]

  return (
    <Card variant={'elevated'}>
      <div className='flex items-start gap-5'>
        <IconContainer variant={insight.severity}>
          <InsightIcon />
        </IconContainer>

        <div className='flex-1'>
          <h3 className='mb-2 font-medium text-white'>{insight.title}</h3>
          <p className='mb-5 text-slate-400 text-sm leading-relaxed'>
            {insight.description}
          </p>

          {insight.insight_type === 'topic_difficulty' && (
            <TopicDifficultyActionButton insight={insight} />
          )}
          {insight.insight_type === 'quiz_review_pending' && (
            <SimpleActionButton insight={insight} />
          )}
          {insight.insight_type === 'low_attendance' && (
            <SimpleActionButton insight={insight} />
          )}
          {insight.insight_type === 'low_engagement' && (
            <SimpleActionButton insight={insight} />
          )}
        </div>
      </div>
    </Card>
  )
}

function SimpleActionButton({ insight }: { insight: Insight }) {
  const metadata = insight.metadata as Record<string, string>
  const value = Object.values(metadata)[0]

  return (
    <Button className={cn(severityVariants({ severity: insight.severity }))}>
      {value}
    </Button>
  )
}

function TopicDifficultyActionButton({ insight }: { insight: Insight }) {
  const metadata =
    insight.metadata as unknown as InsightMetadataMap['topic_difficulty']
  const { data } = useGetTopicByIdQuery({
    args: {
      topicId: metadata.topic_id,
    },
  })

  return (
    <Button
      nativeButton={false}
      render={
        <Link
          to='/content/topic/$id'
          params={{
            id: metadata.topic_id,
          }}
        />
      }
      className={cn(severityVariants({ severity: insight.severity }))}
    >
      {data?.name}
      <ArrowRight className='h-4 w-4 transition-transform group-hover/btn:translate-x-0.5' />
    </Button>
  )
}
