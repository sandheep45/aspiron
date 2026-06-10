import {
  useTopicActionsQuery,
  useTopicComponentsQuery,
  useTopicIssuesQuery,
  useTopicOverviewQuery,
  useTopicTrendsQuery,
} from '@aspiron/tanstack-client'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Brain,
  RefreshCw,
  TrendingDown,
  Users,
} from 'lucide-react'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeader } from '@/components/ui/section-header'
import { ContentComponentCard } from '@/features/topic-detail/components/content-component-card'
import { LearningIssueCard } from '@/features/topic-detail/components/learning-issue-card'
import {
  LearningIssueCardSkeleton,
  TopicHealthCardSkeleton,
} from '@/features/topic-detail/components/loading-skeleton'
import { PerformanceCharts } from '@/features/topic-detail/components/performance-charts'
import { QuickActionsBar } from '@/features/topic-detail/components/quick-actions-bar'
import { StatusBadge } from '@/features/topic-detail/components/status-badge'
import { TopicHealthCard } from '@/features/topic-detail/components/topic-health-card'

interface TopicDetailPageProps {
  topicId: string
  topicName: string
  onBack: () => void
  onActionClick?: (componentId: string) => void
}

function deriveOverallStatus(
  overview:
    | {
        recall_strength: string
        dropoff_indicator: string
        engagement_trend: string
      }
    | undefined,
): string {
  if (!overview) return 'Needs Attention'
  const negatives = [
    overview.recall_strength === 'weak',
    overview.dropoff_indicator === 'high',
    overview.engagement_trend === 'declining',
  ].filter(Boolean).length
  if (negatives >= 2) return 'Critical'
  if (negatives >= 1) return 'Needs Attention'
  return 'Healthy'
}

export function TopicDetailPage({
  topicId,
  topicName,
  onBack,
  onActionClick,
}: TopicDetailPageProps) {
  const overview = useTopicOverviewQuery({ args: { topicId } })
  const issues = useTopicIssuesQuery({ args: { topicId } })
  const components = useTopicComponentsQuery({ args: { topicId } })
  const actions = useTopicActionsQuery({ args: { topicId } })
  const trends = useTopicTrendsQuery({ args: { topicId } })

  const overallStatus = deriveOverallStatus(overview.data)

  const handleRefresh = useCallback(() => {
    overview.refetch()
    issues.refetch()
    components.refetch()
    actions.refetch()
    trends.refetch()
  }, [overview, issues, components, actions, trends])

  return (
    <div className='flex w-full flex-col gap-8 pb-10'>
      {/* Back Navigation */}
      <button
        type='button'
        onClick={onBack}
        className='group flex w-fit items-center gap-1.5 text-slate-400 text-sm transition-colors hover:text-white'
      >
        <ArrowLeft className='size-4 transition-transform group-hover:-translate-x-0.5' />
        Back to Topics
      </button>

      {/* Page Header */}
      <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-3'>
            <h1 className='font-semibold text-2xl text-white'>{topicName}</h1>
            <StatusBadge status={overallStatus} />
          </div>
          <p className='text-slate-400 text-sm'>
            Control hub for managing this topic's content and performance
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon-sm' onClick={handleRefresh}>
            <RefreshCw className='size-3.5' />
          </Button>
        </div>
      </header>

      {/* Section 1: Topic Health Snapshot */}
      <section>
        <SectionHeader title='Topic Health Snapshot' accent='bg-sky-500' />

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {overview.isLoading ? (
            <>
              <TopicHealthCardSkeleton />
              <TopicHealthCardSkeleton />
              <TopicHealthCardSkeleton />
              <TopicHealthCardSkeleton />
            </>
          ) : overview.isError ? (
            <div className='col-span-full flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
              <p className='text-red-300 text-sm'>
                {overview.error?.message || 'Failed to load topic health'}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => overview.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : overview.data ? (
            <>
              <TopicHealthCard
                icon={Brain}
                title='Recall Strength'
                value={overview.data.recall_strength}
                supportingText='Memory retention accuracy'
              />
              <TopicHealthCard
                icon={Activity}
                title='Practice Accuracy'
                value={overview.data.practice_accuracy}
                supportingText='Average quiz score'
              />
              <TopicHealthCard
                icon={TrendingDown}
                title='Drop-off Indicator'
                value={overview.data.dropoff_indicator}
                supportingText='Session completion rate'
              />
              <TopicHealthCard
                icon={Users}
                title='Engagement Trend'
                value={overview.data.engagement_trend}
                supportingText='Student activity over time'
              />
            </>
          ) : null}
        </div>
      </section>

      {/* Section 2: Learning Issues Detected (HIGHEST PRIORITY) */}
      <section>
        <SectionHeader
          title='Learning Issues Detected'
          accent='bg-red-500'
          action={
            issues.data && issues.data.length > 0 ? (
              <span className='rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 font-semibold text-[0.7rem] text-red-400'>
                {issues.data.length} issue{issues.data.length !== 1 ? 's' : ''}
              </span>
            ) : null
          }
        />

        {issues.isLoading ? (
          <div className='space-y-3'>
            <LearningIssueCardSkeleton />
            <LearningIssueCardSkeleton />
          </div>
        ) : issues.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {issues.error?.message || 'Failed to load issues'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => issues.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : issues.data && issues.data.length > 0 ? (
          <div className='space-y-3'>
            {issues.data.map((issue) => (
              <LearningIssueCard
                key={issue.id}
                id={issue.id}
                title={issue.title}
                severity={issue.severity}
                description={issue.description}
                recommendation={issue.recommendation}
                actionLabel={issue.action_label}
                variant={issue.id === 'no-issues' ? 'success' : 'default'}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={AlertTriangle}
            title='No issues detected'
            description='This topic appears to be performing well across all metrics.'
          />
        )}
      </section>

      {/* Section 3: Content Components */}
      <section>
        <SectionHeader title='Content Components' accent='bg-indigo-500' />

        {components.isLoading ? (
          <div className='grid gap-4 sm:grid-cols-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='flex animate-pulse flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'
              >
                <div className='flex items-center gap-3'>
                  <div className='size-10 rounded-lg bg-slate-800' />
                  <div className='flex flex-1 flex-col gap-1.5'>
                    <div className='h-4 w-28 rounded bg-slate-800' />
                    <div className='h-3 w-20 rounded bg-slate-800' />
                  </div>
                </div>
                <div className='h-3 w-32 rounded bg-slate-800' />
                <div className='h-8 w-full rounded-lg bg-slate-800' />
              </div>
            ))}
          </div>
        ) : components.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {components.error?.message || 'Failed to load components'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => components.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : components.data && components.data.length > 0 ? (
          <div className='grid gap-4 sm:grid-cols-2'>
            {components.data.map((component) => (
              <ContentComponentCard
                key={component.id}
                {...component}
                onActionClick={onActionClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={AlertTriangle}
            title='No components found'
            description='Content components will appear once they are added to this topic.'
          />
        )}
      </section>

      {/* Section 4: Quick Actions */}
      <section>
        <SectionHeader title='Quick Actions' accent='bg-emerald-500' />

        <QuickActionsBar
          actions={actions.data ?? []}
          loading={actions.isLoading}
        />

        {actions.isError && (
          <div className='mt-3 flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {actions.error?.message || 'Failed to load actions'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => actions.refetch()}
            >
              Retry
            </Button>
          </div>
        )}
      </section>

      {/* Section 5: Performance Trends (optional) */}
      {trends.data || trends.isLoading ? (
        <section>
          <SectionHeader title='Performance Trends' accent='bg-purple-500' />

          {trends.isError ? (
            <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
              <p className='text-red-300 text-sm'>
                {trends.error?.message || 'Failed to load trends'}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => trends.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <PerformanceCharts
              data={trends.data ?? null}
              loading={trends.isLoading}
            />
          )}
        </section>
      ) : null}
    </div>
  )
}
