import {
  useSubjectChaptersQuery,
  useSubjectInsightsQuery,
  useSubjectSummaryQuery,
} from '@aspiron/tanstack-client'
import { useNavigate, useParams } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/ui/section-header'
import { ChapterSummaryCard } from '@/features/chapters-page/components/chapter-summary-card'
import { ChaptersTable } from '@/features/chapters-page/components/chapters-table'
import { LoadingSkeleton } from '@/features/chapters-page/components/loading-skeleton'
import { QuickInsightsSection } from '@/features/chapters-page/components/quick-insights-section'

export function ChaptersPage() {
  const { subjectId } = useParams({
    from: '/_private-routes/content/_content-layout/subjects/$subjectId/chapters/',
  })
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('coverage')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const limit = 10

  const queryArgs = useMemo(
    () => ({
      subjectId,
      search: search || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      limit,
    }),
    [subjectId, search, sortBy, sortOrder, page],
  )

  const summary = useSubjectSummaryQuery({
    args: { subjectId },
  })
  const chapters = useSubjectChaptersQuery({
    args: queryArgs,
  })
  const insights = useSubjectInsightsQuery({
    args: { subjectId },
  })

  const handleRefresh = useCallback(() => {
    summary.refetch()
    chapters.refetch()
    insights.refetch()
  }, [summary, chapters, insights])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleSortByChange = useCallback((value: string) => {
    setSortBy(value)
    setPage(1)
  }, [])

  const handleSortOrderChange = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleViewChapter = useCallback(
    (chapterId: string) => {
      navigate({
        to: '/content/subjects/$subjectId/chapters/$chapterId/topics',
        params: { subjectId, chapterId },
      })
    },
    [navigate, subjectId],
  )

  const subjectName = summary.data?.subject_name ?? 'Subject'

  return (
    <div className='flex w-full min-w-0 flex-col gap-8 overflow-x-hidden pb-10'>
      {/* Header */}
      <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='font-semibold text-2xl text-white'>
            {summary.isLoading ? '...' : subjectName}
          </h1>
          <p className='mt-1 text-slate-400 text-sm'>
            Overview of all chapters and their performance metrics
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon-sm' onClick={handleRefresh}>
            <RefreshCw className='size-3.5' />
          </Button>
        </div>
      </header>

      {/* Section 1: Chapter Summary */}
      <section className='min-w-0'>
        {summary.isLoading ? (
          <LoadingSkeleton variant='summary' />
        ) : summary.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {summary.error?.message || 'Failed to load subject summary'}
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
          <ChapterSummaryCard summary={summary.data} />
        ) : null}
      </section>

      {/* Section 2: Chapters Table (PRIMARY) */}
      <section className='min-w-0'>
        <SectionHeader
          title='All Chapters'
          accent='bg-indigo-500'
          description='Review chapter health, coverage, and performance'
        />
        {chapters.isLoading ? (
          <LoadingSkeleton variant='table' />
        ) : chapters.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {chapters.error?.message || 'Failed to load chapters'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => chapters.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <ChaptersTable
            chapters={chapters.data ?? []}
            search={search}
            sortBy={sortBy}
            sortOrder={sortOrder}
            page={page}
            limit={limit}
            totalFiltered={chapters.data?.length ?? 0}
            onSearchChange={handleSearchChange}
            onSortByChange={handleSortByChange}
            onSortOrderChange={handleSortOrderChange}
            onPageChange={handlePageChange}
            onViewChapter={handleViewChapter}
          />
        )}
      </section>

      {/* Section 3: Quick Insights */}
      <section className='min-w-0'>
        <SectionHeader
          title='Quick Insights'
          accent='bg-amber-500'
          description='Chapter-level patterns and signals'
        />
        {insights.isLoading ? (
          <LoadingSkeleton variant='insights' />
        ) : insights.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {insights.error?.message || 'Failed to load insights'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => insights.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : insights.data && insights.data.length > 0 ? (
          <QuickInsightsSection insights={insights.data} />
        ) : (
          <p className='text-center text-slate-500 text-xs'>
            No insights available yet.
          </p>
        )}
      </section>
    </div>
  )
}
