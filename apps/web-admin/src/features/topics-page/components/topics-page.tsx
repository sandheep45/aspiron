import {
  useChapterInsightsQuery,
  useChapterTopicsQuery,
  useTopicSummaryQuery,
} from '@aspiron/tanstack-client'
import { useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDebounceValue } from '@/hooks/use-debounce-value'
import { LoadingSkeleton } from './loading-skeleton'
import { PatternInsightsSection } from './pattern-insights-section'
import { TopicSummaryCard } from './topic-summary-card'
import { TopicsTable } from './topics-table'

interface TopicsPageProps {
  onBack?: () => void
  onViewTopic?: (topicId: string) => void
}

export function TopicsPage({ onBack, onViewTopic }: TopicsPageProps) {
  const { chapterId } = useParams({
    from: '/_private-routes/content/_content-layout/subjects/$subjectId/chapters/$chapterId/topics/',
  })
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounceValue(search, 300)
  const [sortBy, setSortBy] = useState<string | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [contentStatusFilter, setContentStatusFilter] = useState<
    string | undefined
  >()
  const [recallFilter, setRecallFilter] = useState<string | undefined>()
  const [videoFilter, setVideoFilter] = useState<string | undefined>()
  const limit = 10

  const topicsArgs = useMemo(
    () =>
      ({
        chapterId,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        limit,
        status_filter: statusFilter,
        content_status_filter: contentStatusFilter,
        recall_filter: recallFilter,
        video_filter: videoFilter,
      }) as const,
    [
      debouncedSearch,
      sortBy,
      sortOrder,
      page,
      statusFilter,
      contentStatusFilter,
      recallFilter,
      videoFilter,
      chapterId,
    ],
  )

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErr,
    refetch: refetchSummary,
  } = useTopicSummaryQuery({
    args: { chapterId },
  })

  const {
    data: topics,
    isLoading: topicsLoading,
    isError: topicsError,
    error: topicsErr,
    refetch: refetchTopics,
  } = useChapterTopicsQuery({
    args: topicsArgs,
  })

  const {
    data: insights,
    isLoading: insightsLoading,
    isError: insightsError,
    error: insightsErr,
    refetch: refetchInsights,
  } = useChapterInsightsQuery({
    args: { chapterId },
  })

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleSortByChange = useCallback((value: string | undefined) => {
    setSortBy(value)
    setPage(1)
  }, [])

  const handleSortOrderChange = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }, [])

  const handleStatusFilterChange = useCallback((value: string | undefined) => {
    setStatusFilter(value)
    setPage(1)
  }, [])

  const handleContentStatusFilterChange = useCallback(
    (value: string | undefined) => {
      setContentStatusFilter(value)
      setPage(1)
    },
    [],
  )

  const handleRecallFilterChange = useCallback((value: string | undefined) => {
    setRecallFilter(value)
    setPage(1)
  }, [])

  const handleVideoFilterChange = useCallback((value: string | undefined) => {
    setVideoFilter(value)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleRefresh = useCallback(() => {
    refetchSummary()
    refetchTopics()
    refetchInsights()
  }, [refetchSummary, refetchTopics, refetchInsights])

  const sectionHeaderClass =
    'mb-2 flex items-center gap-2 text-slate-400 text-xs tracking-wider uppercase'

  return (
    <div className='space-y-6'>
      {/* Back navigation */}
      <button
        type='button'
        onClick={onBack}
        className='flex items-center gap-1.5 text-slate-400 text-sm transition-colors hover:text-white'
      >
        <ArrowLeft className='size-4' />
        Back to Chapters
      </button>

      {/* Page header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-semibold text-3xl text-white'>
            {summary?.chapter_name ?? 'Topics'}
          </h1>
          <p className='mt-1 text-slate-400 text-sm'>
            All topics in this chapter and their performance metrics
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={handleRefresh}
          aria-label='Refresh'
        >
          Refresh
        </Button>
      </div>

      {/* Section 1: Topic Summary */}
      <section>
        <div className={sectionHeaderClass}>
          <span>Topic Summary</span>
        </div>
        {summaryLoading ? (
          <LoadingSkeleton variant='summary' />
        ) : summaryError ? (
          <div className='flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-red-400 text-sm'>
            <span>
              Failed to load summary: {(summaryErr as Error)?.message}
            </span>
            <button
              type='button'
              onClick={() => refetchSummary()}
              className='ml-auto rounded bg-red-900/50 px-3 py-1 text-xs transition-colors hover:bg-red-800/50'
            >
              Retry
            </button>
          </div>
        ) : summary ? (
          <TopicSummaryCard summary={summary} />
        ) : null}
      </section>

      {/* Section 2: All Topics (PRIMARY) */}
      <section>
        <div className={sectionHeaderClass}>
          <span>All Topics</span>
        </div>
        {topicsLoading ? (
          <LoadingSkeleton variant='table' />
        ) : topicsError ? (
          <div className='flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-red-400 text-sm'>
            <span>Failed to load topics: {(topicsErr as Error)?.message}</span>
            <button
              type='button'
              onClick={() => refetchTopics()}
              className='ml-auto rounded bg-red-900/50 px-3 py-1 text-xs transition-colors hover:bg-red-800/50'
            >
              Retry
            </button>
          </div>
        ) : topics ? (
          <TopicsTable
            topics={topics}
            search={search}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSortByChange={handleSortByChange}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            contentStatusFilter={contentStatusFilter}
            onContentStatusFilterChange={handleContentStatusFilterChange}
            recallFilter={recallFilter}
            onRecallFilterChange={handleRecallFilterChange}
            videoFilter={videoFilter}
            onVideoFilterChange={handleVideoFilterChange}
            page={page}
            onPageChange={handlePageChange}
            limit={limit}
            onViewTopic={onViewTopic}
          />
        ) : null}
      </section>

      {/* Section 3: Quick Pattern Insights */}
      <section>
        <div className={sectionHeaderClass}>
          <span>Quick Pattern Insights</span>
        </div>
        {insightsLoading ? (
          <LoadingSkeleton variant='insights' />
        ) : insightsError ? (
          <div className='flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-red-400 text-sm'>
            <span>
              Failed to load insights: {(insightsErr as Error)?.message}
            </span>
            <button
              type='button'
              onClick={() => refetchInsights()}
              className='ml-auto rounded bg-red-900/50 px-3 py-1 text-xs transition-colors hover:bg-red-800/50'
            >
              Retry
            </button>
          </div>
        ) : insights ? (
          <PatternInsightsSection insights={insights} />
        ) : null}
      </section>
    </div>
  )
}
