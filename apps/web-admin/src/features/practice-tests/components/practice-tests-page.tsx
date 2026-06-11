import type { PracticeOverview } from '@aspiron/api-client'
import {
  usePracticeOverviewQuery,
  usePracticeSignalsQuery,
  useQuestionsQuery,
  useTestAnalyticsQuery,
  useTopicTestsQuery,
} from '@aspiron/tanstack-client'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ClipboardList, Plus, RefreshCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeader } from '@/components/ui/section-header'
import {
  OverviewSkeleton,
  TopicTestCardSkeleton,
} from '@/features/practice-tests/components/loading-skeleton'
import { PracticeOverviewCard } from '@/features/practice-tests/components/practice-overview-card'
import { QualitySignalsSection } from '@/features/practice-tests/components/quality-signals-section'
import { QuestionsTable } from '@/features/practice-tests/components/questions-table'
import { QuickActionsBar } from '@/features/practice-tests/components/quick-actions-bar'
import { TopicTestCard } from '@/features/practice-tests/components/topic-test-card'
import { StatusBadge } from '@/features/topic-detail/components/status-badge'

interface PracticeTestsPageProps {
  topicId: string
  onBack: () => void
}

const CHART_COLORS = ['#34d399', '#f59e0b', '#ef4444']

function deriveStatus(overview: PracticeOverview | undefined): string {
  if (!overview) return 'Needs Attention'
  const accuracy = overview.average_accuracy
  if (accuracy >= 70 && overview.total_questions > 0) return 'Healthy'
  if (accuracy >= 40) return 'Needs Attention'
  return 'Critical'
}

export function PracticeTestsPage({ topicId, onBack }: PracticeTestsPageProps) {
  const navigate = useNavigate()
  const [questionParams, setQuestionParams] = useState({
    page: 1,
    limit: 10,
  })
  const handleAddQuestion = useCallback(() => {
    navigate({
      to: '/content/topic/$id/create-question',
      params: { id: topicId },
    })
  }, [navigate, topicId])

  const overview = usePracticeOverviewQuery({ args: { topicId } })
  const questions = useQuestionsQuery({
    args: { topicId, ...questionParams },
  })
  const topicTests = useTopicTestsQuery({ args: { topicId } })
  const signals = usePracticeSignalsQuery({ args: { topicId } })
  const analytics = useTestAnalyticsQuery({ args: { topicId } })

  const _overallStatus = deriveStatus(overview.data)

  const handleRefresh = useCallback(() => {
    overview.refetch()
    questions.refetch()
    topicTests.refetch()
    signals.refetch()
    analytics.refetch()
  }, [overview, questions, topicTests, signals, analytics])

  const handleQuestionParamsChange = useCallback(
    (params: Record<string, unknown>) => {
      setQuestionParams((prev) => ({ ...prev, ...params }))
    },
    [],
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
              Practice & Tests
            </h1>
            <StatusBadge status='Healthy' />
          </div>
          <p className='text-slate-400 text-sm'>
            Manage practice questions and topic-level tests for quality and
            coverage
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon-sm' onClick={handleRefresh}>
            <RefreshCw className='size-3.5' />
          </Button>
        </div>
      </header>

      {/* Section 1: Practice Overview */}
      <section>
        <SectionHeader
          title='Practice Overview'
          description='Quick assessment health snapshot'
          accent='bg-sky-500'
        />
        {overview.isLoading ? (
          <OverviewSkeleton />
        ) : overview.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {overview.error?.message || 'Failed to load overview'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => overview.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <PracticeOverviewCard data={overview.data} />
        )}
      </section>

      {/* Section 2: Practice Questions (Primary) */}
      <section>
        <SectionHeader
          title='Practice Questions'
          accent='bg-indigo-500'
          action={
            <span className='flex items-center gap-3'>
              {questions.data && (
                <span className='text-slate-400 text-xs'>
                  {questions.data.total} Question
                  {questions.data.total !== 1 ? 's' : ''}
                </span>
              )}
              <Button
                variant='brand'
                size='sm'
                className='h-7 gap-1.5 text-xs'
                onClick={handleAddQuestion}
              >
                <Plus className='size-3.5' />
                Add Question
              </Button>
            </span>
          }
        />
        <QuestionsTable
          items={questions.data?.items}
          total={questions.data?.total ?? 0}
          page={questionParams.page}
          limit={questionParams.limit}
          totalPages={questions.data?.total_pages ?? 0}
          loading={questions.isLoading}
          onParamsChange={handleQuestionParamsChange}
        />
        {questions.isError && (
          <div className='mt-3 flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {questions.error?.message || 'Failed to load questions'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => questions.refetch()}
            >
              Retry
            </Button>
          </div>
        )}
      </section>

      {/* Section 3: Topic Tests */}
      <section>
        <SectionHeader
          title='Topic Tests'
          accent='bg-emerald-500'
          action={
            <span className='flex items-center gap-3'>
              {topicTests.data && (
                <span className='text-slate-400 text-xs'>
                  {topicTests.data.length} Test
                  {topicTests.data.length !== 1 ? 's' : ''}
                </span>
              )}
              <Button
                variant='brand'
                size='sm'
                className='h-7 gap-1.5 text-xs'
                onClick={() =>
                  navigate({
                    to: '/content/topic/$id/create-test',
                    params: { id: topicId },
                  })
                }
              >
                <Plus className='size-3.5' />
                Create Test
              </Button>
            </span>
          }
        />
        {topicTests.isLoading ? (
          <div className='space-y-3'>
            <TopicTestCardSkeleton />
            <TopicTestCardSkeleton />
            <TopicTestCardSkeleton />
          </div>
        ) : topicTests.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {topicTests.error?.message || 'Failed to load tests'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => topicTests.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : topicTests.data && topicTests.data.length > 0 ? (
          <div className='space-y-3'>
            {topicTests.data.map((test) => (
              <TopicTestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title='No tests created yet'
            description='Create your first topic test to assess student understanding.'
            actions={
              <Button
                variant='brand'
                size='sm'
                className='mt-2 h-7 gap-1.5 text-xs'
                onClick={() =>
                  navigate({
                    to: '/content/topic/$id/create-test',
                    params: { id: topicId },
                  })
                }
              >
                <Plus className='size-3.5' />
                Create Test
              </Button>
            }
          />
        )}
      </section>

      {/* Section 4: Quality Signals & Insights */}
      <section>
        <SectionHeader
          title='Quality Signals & Insights'
          description='Assessment quality indicators'
          accent='bg-amber-500'
        />
        <QualitySignalsSection
          signals={signals.data}
          loading={signals.isLoading}
          error={signals.error}
          onRetry={() => signals.refetch()}
        />
      </section>

      {/* Section 5: Quick Actions */}
      <section>
        <SectionHeader
          title='Quick Actions'
          description='Common educator workflows'
          accent='bg-purple-500'
        />
        <QuickActionsBar />
      </section>

      {/* Section 6: Test Performance (optional) */}
      {(analytics.data || analytics.isLoading) && (
        <section>
          <SectionHeader
            title='Test Performance Analytics'
            description='Score trends, difficulty distribution, and question performance'
            accent='bg-rose-500'
          />
          {analytics.isLoading ? (
            <div className='grid gap-6 md:grid-cols-2'>
              <div className='h-64 animate-pulse rounded-2xl bg-slate-800/50' />
              <div className='h-64 animate-pulse rounded-2xl bg-slate-800/50' />
              <div className='h-64 animate-pulse rounded-2xl bg-slate-800/50' />
              <div className='h-64 animate-pulse rounded-2xl bg-slate-800/50' />
            </div>
          ) : analytics.isError ? (
            <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
              <p className='text-red-300 text-sm'>
                {analytics.error?.message || 'Failed to load analytics'}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => analytics.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : analytics.data ? (
            <div className='grid gap-6 md:grid-cols-2'>
              {/* Average Score Trend */}
              <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
                <span className='font-medium text-slate-400 text-xs uppercase tracking-wide'>
                  Average Score Trend
                </span>
                <div className='h-48'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart
                      data={analytics.data.average_score_trend}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='rgba(255,255,255,0.05)'
                      />
                      <XAxis
                        dataKey='date'
                        tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15,23,42,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: 'rgba(148,163,184,0.8)' }}
                      />
                      <Line
                        type='monotone'
                        dataKey='value'
                        stroke='#818cf8'
                        strokeWidth={2}
                        dot={{ fill: '#818cf8', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attempts Trend */}
              <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
                <span className='font-medium text-slate-400 text-xs uppercase tracking-wide'>
                  Attempts Trend
                </span>
                <div className='h-48'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart
                      data={analytics.data.attempts_trend}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='rgba(255,255,255,0.05)'
                      />
                      <XAxis
                        dataKey='date'
                        tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15,23,42,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: 'rgba(148,163,184,0.8)' }}
                      />
                      <Line
                        type='monotone'
                        dataKey='value'
                        stroke='#34d399'
                        strokeWidth={2}
                        dot={{ fill: '#34d399', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Difficulty Distribution */}
              <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
                <span className='font-medium text-slate-400 text-xs uppercase tracking-wide'>
                  Difficulty Distribution
                </span>
                <div className='h-48'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={analytics.data.difficulty_distribution}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='rgba(255,255,255,0.05)'
                      />
                      <XAxis
                        dataKey='difficulty'
                        tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15,23,42,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: 'rgba(148,163,184,0.8)' }}
                      />
                      <Bar dataKey='count' radius={[4, 4, 0, 0]}>
                        {analytics.data.difficulty_distribution.map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                              fillOpacity={0.7}
                            />
                          ),
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Question Performance */}
              <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
                <span className='font-medium text-slate-400 text-xs uppercase tracking-wide'>
                  Question Performance
                </span>
                <div className='h-48 overflow-y-auto'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr className='border-white/5 border-b text-[0.6rem] text-slate-500 uppercase'>
                        <th className='py-1.5 pr-2 text-left font-medium'>
                          Question
                        </th>
                        <th className='px-2 py-1.5 text-right font-medium'>
                          Rate
                        </th>
                        <th className='py-1.5 pl-2 text-right font-medium'>
                          Attempts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.data.question_performance.map((qp) => (
                        <tr
                          key={qp.question_id}
                          className='border-white/5 border-b last:border-0'
                        >
                          <td className='max-w-[180px] truncate py-1.5 pr-2 text-slate-300'>
                            {qp.question}
                          </td>
                          <td className='px-2 py-1.5 text-right tabular-nums'>
                            <span
                              className={
                                qp.correct_rate >= 80
                                  ? 'text-emerald-400'
                                  : qp.correct_rate >= 60
                                    ? 'text-amber-400'
                                    : 'text-red-400'
                              }
                            >
                              {Math.round(qp.correct_rate)}%
                            </span>
                          </td>
                          <td className='py-1.5 pl-2 text-right text-slate-400 tabular-nums'>
                            {qp.attempts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}
