import {
  type AttentionQueryParams,
  useAttentionItemsQuery,
  useContentSignalsQuery,
  useContentSummaryQuery,
  useSubjectProgressQuery,
} from '@aspiron/tanstack-client'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Pencil,
  RefreshCw,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/ui/section-header'
import { ContentAttentionTable } from '@/features/content-dashboard/components/content-attention-table'
import {
  MetricCardSkeleton,
  SignalsSectionSkeleton,
  SubjectProgressSkeleton,
} from '@/features/content-dashboard/components/loading-skeleton'
import { MetricCard } from '@/features/content-dashboard/components/metric-card'
import { QualitySignalsSection } from '@/features/content-dashboard/components/quality-signals-section'
import { SubjectProgressCard } from '@/features/content-dashboard/components/subject-progress-card'
import { useDebounceValue } from '@/hooks/use-debounce-value'

type SortField = 'topic' | 'issue' | 'students'
type SortOrder = 'asc' | 'desc'

export function ContentDashboardPage() {
  const summary = useContentSummaryQuery()
  const subjects = useSubjectProgressQuery()
  const signals = useContentSignalsQuery()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', 300)
  const [issueFilter, setIssueFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('students')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const limit = 5

  const attentionArgs: AttentionQueryParams = {
    sort_by: sortBy,
    sort_order: sortOrder,
    search: debouncedSearch || undefined,
    issue: issueFilter || undefined,
    page,
    limit,
  }

  const attention = useAttentionItemsQuery({ args: attentionArgs })

  const handleViewTopic = useCallback((_id: string) => {
    console.warn('onViewTopic not implemented yet', _id)
  }, [])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      setDebouncedSearch(value)
      setPage(1)
    },
    [setDebouncedSearch],
  )

  const handleIssueFilterChange = useCallback((value: string) => {
    setIssueFilter(value)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((field: SortField) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortOrder('desc')
      }
      return field
    })
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleRefresh = useCallback(() => {
    summary.refetch()
    attention.refetch()
    subjects.refetch()
    signals.refetch()
  }, [summary, attention, subjects, signals])

  return (
    <div className='flex w-full flex-col gap-8 pb-10'>
      {/* Header */}
      <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='font-semibold text-2xl text-white'>Content</h1>
          <p className='mt-1 text-slate-400 text-sm'>
            Overview of existing content and where to work next
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon-sm' onClick={handleRefresh}>
            <RefreshCw className='size-3.5' />
          </Button>
        </div>
      </header>

      {/* Section 1: Content Health Snapshot */}
      <section>
        <SectionHeader title='Content Health Snapshot' accent='bg-sky-500' />

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {summary.isLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : summary.isError ? (
            <div className='col-span-full flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
              <p className='text-red-300 text-sm'>
                {summary.error?.message || 'Failed to load content summary'}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => summary.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : summary.data ? (
            <>
              <MetricCard
                icon={BookOpen}
                title='Subjects Covered'
                value={Number(summary.data.subjects_covered)}
                supportingText='Subjects in the curriculum'
              />
              <MetricCard
                icon={CheckCircle}
                title='Topics Published'
                value={Number(summary.data.topics_published)}
                supportingText='Published and available to students'
              />
              <MetricCard
                icon={Pencil}
                title='Topics In Draft'
                value={Number(summary.data.topics_in_draft)}
                supportingText='Ready for review'
              />
              <MetricCard
                icon={AlertTriangle}
                title='Topics Flagged As Weak'
                value={Number(summary.data.topics_flagged)}
                supportingText='Based on student performance'
              />
            </>
          ) : null}
        </div>
      </section>

      {/* Section 2: Content Needing Attention */}
      <section>
        <SectionHeader
          title='Content Needing Attention'
          accent='bg-amber-500'
          action={
            attention.data && (
              <span className='rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-semibold text-[0.7rem] text-amber-400'>
                {Number(attention.data.total)} items
              </span>
            )
          }
        />

        {attention.isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='flex animate-pulse items-center gap-4 rounded-lg border border-white/5 p-4'
              >
                <div className='h-4 w-48 rounded bg-slate-800' />
                <div className='h-5 w-24 rounded-full bg-slate-800' />
                <div className='h-4 w-40 rounded bg-slate-800' />
                <div className='h-4 w-16 rounded bg-slate-800' />
                <div className='h-6 w-20 rounded-lg bg-slate-800' />
              </div>
            ))}
          </div>
        ) : attention.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {attention.error?.message || 'Failed to load attention items'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => attention.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <ContentAttentionTable
            items={attention.data?.items ?? []}
            total={Number(attention.data?.total ?? 0)}
            onViewTopic={handleViewTopic}
            search={search}
            onSearchChange={handleSearchChange}
            issueFilter={issueFilter}
            onIssueFilterChange={handleIssueFilterChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
          />
        )}
      </section>

      {/* Section 3: Subject Entry Points */}
      <section>
        <SectionHeader
          title='Subject Entry Points'
          accent='bg-indigo-500'
          action={
            <Button
              variant='ghost'
              size='xs'
              className='h-7 px-2 font-medium text-indigo-400 text-xs hover:text-indigo-300'
              onClick={() => console.warn('View Subjects not implemented')}
            >
              View Subjects
            </Button>
          }
        />

        {subjects.isLoading ? (
          <SubjectProgressSkeleton />
        ) : subjects.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {subjects.error?.message || 'Failed to load subject progress'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => subjects.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : subjects.data && subjects.data.length > 0 ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {subjects.data.map((subject) => (
              <SubjectProgressCard key={subject.id} subject={subject} />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-10 text-center backdrop-blur-sm'>
            <div className='flex size-12 items-center justify-center rounded-full bg-slate-800/50'>
              <BookOpen className='size-5 text-slate-500' />
            </div>
            <div>
              <p className='font-medium text-slate-300 text-sm'>
                No subjects found
              </p>
              <p className='mt-1 text-slate-500 text-xs'>
                Subjects will appear once content is added.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Section 4: Content Quality Signals */}
      {signals.isLoading ? (
        <SignalsSectionSkeleton />
      ) : signals.isError ? (
        <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
          <p className='text-red-300 text-sm'>
            {signals.error?.message || 'Failed to load quality signals'}
          </p>
          <Button variant='outline' size='sm' onClick={() => signals.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <QualitySignalsSection
          highestRecall={signals.data?.highest_recall ?? []}
          fastestDecay={signals.data?.fastest_decay ?? []}
        />
      )}
    </div>
  )
}
