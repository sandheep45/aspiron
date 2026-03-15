import type { Insight, InsightMetadataMap } from '@aspiron/api-client'
import { useGetTopicByIdQuery, useInsightQuery } from '@aspiron/tanstack-client'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  IconContainer,
  iconContainerVariants,
} from '@/components/ui/icon-container'
import { cn } from '@/lib/utils'
import { dashboardQuickActionRouteMapper } from '../utils'

export function ActionRequired() {
  const { data } = useInsightQuery({
    args: {
      start: BigInt(1767225600),
      end: BigInt(1798761600),
    },
  })
  return (
    <div className='space-y-5'>
      <div className='flex items-center gap-2'>
        <div className='h-6 w-1 rounded-full bg-linear-to-b from-rose-500 to-orange-500'></div>
        <h2 className='font-semibold text-white text-xl'>Action Required</h2>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        {data?.insights.map((insight) => (
          <InsightCard insight={insight} key={insight.id} />
        ))}
      </div>
    </div>
  )
}

function InsightCard({ insight }: { insight: Insight }) {
  const { icon: InsightIcon } =
    dashboardQuickActionRouteMapper[insight.insight_type]
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
            <TopicDifficultyInsightActionButton insight={insight} />
          )}
          {insight.insight_type === 'quiz_review_pending' && (
            <QuizReviewInsightActionButton insight={insight} />
          )}
          {insight.insight_type === 'low_attendance' && (
            <LowAttendanceInsightActionButton insight={insight} />
          )}
          {insight.insight_type === 'low_engagement' && (
            <LowEngagementInsightActionButton insight={insight} />
          )}
        </div>
      </div>
    </Card>
  )
}

const TopicDifficultyInsightActionButton = ({
  insight,
}: {
  insight: Insight
}) => {
  const metadata =
    insight.metadata as unknown as InsightMetadataMap['topic_difficulty']
  const { data } = useGetTopicByIdQuery({
    args: {
      topicId: metadata.topic_id,
    },
  })
  return (
    <Button
      render={
        <Link
          to='/content/topic/$id'
          params={{
            id: metadata.topic_id,
          }}
        />
      }
      className={cn(iconContainerVariants({ variant: insight.severity }))}
    >
      {data?.name}
      <ArrowRight className='h-4 w-4 transition-transform group-hover/btn:translate-x-0.5' />
    </Button>
  )
}

const QuizReviewInsightActionButton = ({ insight }: { insight: Insight }) => {
  const metadata =
    insight.metadata as unknown as InsightMetadataMap['quiz_review_pending']
  return (
    <Button
      className={cn(iconContainerVariants({ variant: insight.severity }))}
    >
      {metadata.quiz_id}
      <ArrowRight className='h-4 w-4 transition-transform group-hover/btn:translate-x-0.5' />
    </Button>
  )
}

const LowAttendanceInsightActionButton = ({
  insight,
}: {
  insight: Insight
}) => {
  const metadata =
    insight.metadata as unknown as InsightMetadataMap['low_attendance']
  return (
    <Button
      className={cn(iconContainerVariants({ variant: insight.severity }))}
    >
      {metadata.session_id}
      <ArrowRight className='h-4 w-4 transition-transform group-hover/btn:translate-x-0.5' />
    </Button>
  )
}

const LowEngagementInsightActionButton = ({
  insight,
}: {
  insight: Insight
}) => {
  const metadata =
    insight.metadata as unknown as InsightMetadataMap['low_engagement']
  return (
    <Button
      className={cn(iconContainerVariants({ variant: insight.severity }))}
    >
      {metadata.topic_id}
      <ArrowRight className='h-4 w-4 transition-transform group-hover/btn:translate-x-0.5' />
    </Button>
  )
}
