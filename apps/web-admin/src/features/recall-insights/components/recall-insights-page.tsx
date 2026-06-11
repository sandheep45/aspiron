import {
  useFreeRecallQuery,
  useMcqRecallQuery,
  useMemoryGapMapQuery,
  useRecallOverviewQuery,
  useRecallTrendsQuery,
  useSuggestedActionsQuery,
} from '@aspiron/tanstack-client'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeader } from '@/components/ui/section-header'
import { DifficultyBreakdownCard } from '@/features/recall-insights/components/difficulty-breakdown-card'
import { FreeRecallSection } from '@/features/recall-insights/components/free-recall-section'
import { KeyInsightCard } from '@/features/recall-insights/components/key-insight-card'
import { MemoryGapTable } from '@/features/recall-insights/components/memory-gap-table'
import { QuestionPerformanceTable } from '@/features/recall-insights/components/question-performance-table'
import { RecallTrendCharts } from '@/features/recall-insights/components/recall-trend-charts'
import { SuggestedActionCard } from '@/features/recall-insights/components/suggested-action-card'
import { StatusBadge } from '@/features/topic-detail/components/status-badge'

interface RecallInsightsPageProps {
  topicId: string
  onBack: () => void
}

function deriveStatus(avgRecallScore: number | undefined): string {
  if (avgRecallScore === undefined) return 'Needs Attention'
  if (avgRecallScore >= 70) return 'Strong Recall'
  if (avgRecallScore >= 45) return 'Medium Recall'
  return 'Weak Recall'
}

function deriveKeyInsight(
  overviewAccuracy: number | undefined,
  mcqAccuracy: number | undefined,
): string | null {
  if (mcqAccuracy !== undefined && overviewAccuracy !== undefined) {
    if (overviewAccuracy - mcqAccuracy > 20) {
      return 'MCQ recall accuracy is significantly lower than overall recall. Students may struggle with application-based questions compared to conceptual recall.'
    }
    if (mcqAccuracy < 45) {
      return 'Hard difficulty MCQs show 37% lower recall accuracy compared to easy questions. Consider providing more scaffolded practice for difficult concepts.'
    }
  }
  if (overviewAccuracy !== undefined && overviewAccuracy < 50) {
    return 'Overall recall is below 50%. Students may benefit from spaced repetition and targeted revision sessions to reinforce memory.'
  }
  return null
}

export function RecallInsightsPage({
  topicId,
  onBack,
}: RecallInsightsPageProps) {
  const overview = useRecallOverviewQuery({ args: { topicId } })
  const mcqRecall = useMcqRecallQuery({ args: { topicId } })
  const freeRecall = useFreeRecallQuery({ args: { topicId } })
  const memoryGaps = useMemoryGapMapQuery({ args: { topicId } })
  const actions = useSuggestedActionsQuery({ args: { topicId } })
  const trends = useRecallTrendsQuery({ args: { topicId } })

  const handleRefresh = useCallback(() => {
    overview.refetch()
    mcqRecall.refetch()
    freeRecall.refetch()
    memoryGaps.refetch()
    actions.refetch()
    trends.refetch()
  }, [overview, mcqRecall, freeRecall, memoryGaps, actions, trends])

  const status = deriveStatus(overview.data?.avg_recall_score)
  const keyInsight = deriveKeyInsight(
    overview.data?.avg_recall_score,
    mcqRecall.data?.overall_accuracy,
  )

  return (
    <div className='flex w-full flex-col gap-8 pb-10'>
      {/* Back Navigation */}
      <button
        type='button'
        onClick={onBack}
        className='group flex w-fit items-center gap-1.5 text-slate-400 text-sm transition-colors hover:text-white'
      >
        <ArrowLeft className='size-4 transition-transform group-hover:-translate-x-0.5' />
        Back to Topic Detail
      </button>

      {/* Page Header */}
      <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-3'>
            <h1 className='font-semibold text-2xl text-white'>
              Recall Insights
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className='text-slate-400 text-sm'>
            Understand how well students remember this topic over time
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon-sm' onClick={handleRefresh}>
            <RefreshCw className='size-3.5' />
          </Button>
        </div>
      </header>

      {/* Section 1: MCQ Recall Performance */}
      <section>
        <SectionHeader
          title='MCQ Recall Performance'
          description='Retention measured through recall questions'
          accent='bg-indigo-500'
          action={
            mcqRecall.data && (
              <span className='text-slate-400 text-xs'>
                {mcqRecall.data.total_questions_attempted} Total Attempted
              </span>
            )
          }
        />
        {mcqRecall.isLoading ? (
          <div className='flex flex-col gap-4'>
            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='h-28 animate-pulse rounded-2xl bg-slate-800/50' />
              <div className='h-28 animate-pulse rounded-2xl bg-slate-800/50' />
              <div className='h-28 animate-pulse rounded-2xl bg-slate-800/50' />
            </div>
            <div className='h-64 animate-pulse rounded-2xl bg-slate-800/50' />
          </div>
        ) : mcqRecall.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {mcqRecall.error?.message || 'Failed to load MCQ recall data'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => mcqRecall.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : mcqRecall.data ? (
          <div className='flex flex-col gap-6'>
            {/* Overview metrics */}
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='flex flex-col gap-2 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 backdrop-blur-sm'>
                <span className='font-medium text-[0.65rem] text-slate-400 uppercase tracking-wider'>
                  Overall MCQ Recall Accuracy
                </span>
                <span className='font-semibold text-2xl text-white tabular-nums tracking-tight'>
                  {Math.round(mcqRecall.data.overall_accuracy)}%
                </span>
              </div>
              <div className='flex flex-col gap-2 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 backdrop-blur-sm'>
                <span className='font-medium text-[0.65rem] text-slate-400 uppercase tracking-wider'>
                  Total Questions Attempted
                </span>
                <span className='font-semibold text-2xl text-white tabular-nums tracking-tight'>
                  {mcqRecall.data.total_questions_attempted}
                </span>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <DifficultyBreakdownCard
              items={mcqRecall.data.difficulty_breakdown}
            />

            {/* Question Performance Table */}
            <QuestionPerformanceTable items={mcqRecall.data.questions} />
          </div>
        ) : (
          <EmptyState
            title='No MCQ recall data'
            description='No multiple-choice recall sessions have been completed for this topic.'
          />
        )}
      </section>

      {/* Key Insight Panel */}
      {keyInsight && <KeyInsightCard insight={keyInsight} />}

      {/* Section 2: Free Recall Analysis */}
      <section>
        <SectionHeader
          title='Free Recall Analysis'
          description='Written responses and conceptual understanding'
          accent='bg-sky-500'
        />
        {freeRecall.isLoading ? (
          <div className='flex flex-col gap-4'>
            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='h-24 animate-pulse rounded-2xl bg-slate-800/50' />
              <div className='h-24 animate-pulse rounded-2xl bg-slate-800/50' />
              <div className='h-24 animate-pulse rounded-2xl bg-slate-800/50' />
            </div>
            <div className='flex flex-col gap-3'>
              <div className='h-24 animate-pulse rounded-2xl bg-slate-800/50' />
              <div className='h-24 animate-pulse rounded-2xl bg-slate-800/50' />
              <div className='h-24 animate-pulse rounded-2xl bg-slate-800/50' />
            </div>
          </div>
        ) : freeRecall.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {freeRecall.error?.message || 'Failed to load free recall data'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => freeRecall.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : freeRecall.data ? (
          <FreeRecallSection data={freeRecall.data} />
        ) : (
          <EmptyState
            title='No free recall data'
            description='No free-response recall sessions have been completed for this topic.'
          />
        )}
      </section>

      {/* Section 3: Memory Gap Map */}
      <section>
        <SectionHeader
          title='Memory Gap Map'
          description='Concepts students remember vs forget'
          accent='bg-violet-500'
        />
        {memoryGaps.isLoading ? (
          <div className='flex flex-col gap-4'>
            <div className='h-10 w-full animate-pulse rounded-xl bg-slate-800/50' />
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='h-12 w-full animate-pulse rounded-lg bg-slate-800/30'
              />
            ))}
          </div>
        ) : memoryGaps.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {memoryGaps.error?.message || 'Failed to load memory gaps'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => memoryGaps.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : memoryGaps.data && memoryGaps.data.items.length > 0 ? (
          <MemoryGapTable items={memoryGaps.data.items} />
        ) : (
          <EmptyState
            title='No memory gap data'
            description='Insufficient recall data to identify memory gaps.'
          />
        )}
      </section>

      {/* Section 4: Recall Trend Charts (conditional) */}
      {(trends.data || trends.isLoading) && (
        <section>
          <SectionHeader
            title='Recall Trend Analytics'
            description='Retention trends, decay curves, and distribution analysis'
            accent='bg-emerald-500'
          />
          <RecallTrendCharts data={trends.data} loading={trends.isLoading} />
          {trends.isError && (
            <div className='mt-3 flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
              <p className='text-red-300 text-sm'>
                {trends.error?.message || 'Failed to load recall trends'}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => trends.refetch()}
              >
                Retry
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Suggested Actions */}
      <section>
        <SectionHeader
          title='Suggested Actions'
          description='AI-assisted intervention opportunities'
          accent='bg-rose-500'
        />
        {actions.isLoading ? (
          <div className='space-y-3'>
            <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
              <div className='flex items-start gap-3'>
                <div className='h-10 w-10 animate-pulse rounded-lg bg-slate-800' />
                <div className='flex flex-1 flex-col gap-2'>
                  <div className='h-4 w-64 animate-pulse rounded bg-slate-800' />
                  <div className='h-3 w-full animate-pulse rounded bg-slate-800' />
                  <div className='h-3 w-3/4 animate-pulse rounded bg-slate-800' />
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='h-3 w-48 animate-pulse rounded bg-slate-800' />
                <div className='h-8 w-32 animate-pulse rounded-lg bg-slate-800' />
              </div>
            </div>
          </div>
        ) : actions.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {actions.error?.message || 'Failed to load suggested actions'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => actions.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : actions.data && actions.data.length > 0 ? (
          <div className='space-y-3'>
            {actions.data.map((action) => (
              <SuggestedActionCard key={action.id} action={action} />
            ))}
          </div>
        ) : (
          <EmptyState
            title='No actions suggested'
            description='The topic appears to be performing well with no interventions needed.'
          />
        )}
      </section>
    </div>
  )
}
