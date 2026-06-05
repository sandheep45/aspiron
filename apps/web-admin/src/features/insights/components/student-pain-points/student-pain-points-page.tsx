import {
  useCriticalIssuesQuery,
  usePainPointsQuery,
  usePatternInsightsQuery,
  useTopicDetailQuery,
} from '@aspiron/tanstack-client'
import { Download, RefreshCw, Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionHeader } from '@/components/ui/section-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CriticalIssuesEmptyState,
  CriticalIssuesSection,
} from '@/features/insights/components/student-pain-points/critical-issues-section'
import {
  CriticalIssuesSkeleton,
  PainPointsTableSkeleton,
  PatternInsightsSkeleton,
} from '@/features/insights/components/student-pain-points/loading-skeleton'
import {
  PatternInsightsEmptyState,
  PatternInsightsSection,
} from '@/features/insights/components/student-pain-points/pattern-insights-section'
import { TopicDetailDrawer } from '@/features/insights/components/student-pain-points/topic-detail-drawer'
import { cn } from '@/lib/utils'

type SortField = 'accuracy' | 'students' | 'last_activity'

const sortOptions: { value: string; label: string; field: SortField }[] = [
  { value: 'accuracy', label: 'Accuracy', field: 'accuracy' },
  { value: 'students', label: 'Students', field: 'students' },
  { value: 'last_activity', label: 'Last Activity', field: 'last_activity' },
]

function RecallStrengthBadge({
  strength,
}: {
  strength: 'weak' | 'medium' | 'strong'
}) {
  const config = {
    weak: 'bg-red-500/15 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    strong: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }
  return (
    <Badge
      variant='outline'
      className={cn(
        'shrink-0 rounded-full border px-2 py-0.5 font-semibold text-[0.6rem]',
        config[strength],
      )}
    >
      {strength}
    </Badge>
  )
}

function StatusBadge({
  status,
}: {
  status: 'degrading' | 'stable' | 'improving'
}) {
  const config = {
    degrading: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    stable: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    improving: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }
  return (
    <Badge
      variant='outline'
      className={cn(
        'shrink-0 rounded-full border px-2 py-0.5 font-semibold text-[0.6rem]',
        config[status],
      )}
    >
      {status}
    </Badge>
  )
}

export function StudentPainPointsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('accuracy')
  const [page, setPage] = useState(1)
  const limit = 10

  const criticalIssues = useCriticalIssuesQuery()
  const painPoints = usePainPointsQuery({
    args: {
      page,
      limit,
      search: search || undefined,
      subject: subjectFilter || undefined,
      severity: severityFilter || undefined,
      status: statusFilter || undefined,
      sort_by: sortBy,
      sort_order: 'asc',
    },
  })

  const patternInsights = usePatternInsightsQuery()

  const topicDetail = useTopicDetailQuery({
    args: { id: selectedTopicId ?? '' },
    enabled: !!selectedTopicId,
  })

  const handleViewTopic = useCallback((id: string) => {
    setSelectedTopicId(id)
    setDrawerOpen(true)
  }, [])

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setDrawerOpen(open)
    if (!open) {
      setSelectedTopicId(null)
    }
  }, [])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value)
      setPage(1)
    },
    [],
  )

  const handleFilterChange = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
      setter(value)
      setPage(1)
    },
    [],
  )

  return (
    <div className='flex w-full flex-col gap-8 pb-10'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='font-semibold text-2xl text-white'>
            Student Pain Points
          </h1>
          <p className='mt-1 text-slate-400 text-sm'>
            Identify where students are struggling and prioritize what to fix
            first.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='gap-1.5 text-xs'
            onClick={() => {}}
          >
            <Download className='size-3.5' />
            Export Report
          </Button>
          <Button
            variant='outline'
            size='icon-sm'
            onClick={() => {
              criticalIssues.refetch()
              painPoints.refetch()
              patternInsights.refetch()
            }}
          >
            <RefreshCw className='size-3.5' />
          </Button>
        </div>
      </header>

      {criticalIssues.isLoading ? (
        <CriticalIssuesSkeleton />
      ) : criticalIssues.isError ? (
        <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
          <p className='text-red-300 text-sm'>
            {criticalIssues.error?.message || 'Failed to load critical issues'}
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => criticalIssues.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : !criticalIssues.data || criticalIssues.data.issues.length === 0 ? (
        <CriticalIssuesEmptyState />
      ) : (
        <CriticalIssuesSection
          issues={criticalIssues.data.issues}
          totalUrgent={Number(criticalIssues.data.total_urgent)}
          onViewTopic={handleViewTopic}
        />
      )}

      <section>
        <SectionHeader
          title='All Pain Points'
          accent='bg-indigo-500'
          description={
            painPoints.data
              ? `${Number(painPoints.data.total)} topics identified`
              : undefined
          }
        />

        <div className='mb-4 flex flex-wrap items-center gap-2'>
          <div className='relative flex-1 sm:max-w-xs'>
            <Search className='pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-500' />
            <Input
              variant='form'
              placeholder='Search topics...'
              className='h-8 pl-8 text-xs'
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div className='w-32'>
            <Select
              value={subjectFilter}
              onValueChange={(v) =>
                handleFilterChange(setSubjectFilter, v ?? '')
              }
            >
              <SelectTrigger size='sm' className='h-8 w-full text-xs'>
                <SelectValue placeholder='Subject' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>All Subjects</SelectItem>
                <SelectItem value='physics'>Physics</SelectItem>
                <SelectItem value='mathematics'>Mathematics</SelectItem>
                <SelectItem value='chemistry'>Chemistry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='w-32'>
            <Select
              value={severityFilter}
              onValueChange={(v) =>
                handleFilterChange(setSeverityFilter, v ?? '')
              }
            >
              <SelectTrigger size='sm' className='h-8 w-full text-xs'>
                <SelectValue placeholder='Severity' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>All Severities</SelectItem>
                <SelectItem value='weak'>Weak</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='strong'>Strong</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='w-32'>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                handleFilterChange(setStatusFilter, v ?? '')
              }
            >
              <SelectTrigger size='sm' className='h-8 w-full text-xs'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>All Statuses</SelectItem>
                <SelectItem value='degrading'>Degrading</SelectItem>
                <SelectItem value='stable'>Stable</SelectItem>
                <SelectItem value='improving'>Improving</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='w-36'>
            <Select
              value={sortBy}
              onValueChange={(v) =>
                handleFilterChange(setSortBy, v as SortField)
              }
            >
              <SelectTrigger size='sm' className='h-8 w-full text-xs'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {painPoints.isLoading ? (
          <PainPointsTableSkeleton />
        ) : painPoints.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {painPoints.error?.message || 'Failed to load pain points'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => painPoints.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : !painPoints.data || painPoints.data.items.length === 0 ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-slate-800/40 border-dashed bg-slate-900/20 p-10 text-center backdrop-blur-sm'>
            <div className='flex size-12 items-center justify-center rounded-full bg-slate-800/50'>
              <Search className='size-5 text-slate-500' />
            </div>
            <div>
              <p className='font-medium text-slate-300 text-sm'>
                No pain points found
              </p>
              <p className='mt-1 text-slate-500 text-xs'>
                Try adjusting your search or filters.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className='overflow-hidden rounded-xl border border-slate-800/50'>
              <Table>
                <TableHeader>
                  <TableRow className='border-slate-800/50 hover:bg-transparent'>
                    <TableHead className='h-9 w-56 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                      Topic
                    </TableHead>
                    <TableHead className='h-9 w-24 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                      Recall Strength
                    </TableHead>
                    <TableHead className='h-9 w-24 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                      Practice Accuracy
                    </TableHead>
                    <TableHead className='h-9 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                      Common Mistake
                    </TableHead>
                    <TableHead className='h-9 w-28 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                      Last Activity
                    </TableHead>
                    <TableHead className='h-9 w-24 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                      Status
                    </TableHead>
                    <TableHead className='h-9 w-20 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                      Students
                    </TableHead>
                    <TableHead className='h-9 w-24 px-3 font-semibold text-[0.65rem] text-slate-500 uppercase tracking-wider'>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {painPoints.data.items.map((item) => (
                    <TableRow
                      key={item.id}
                      className='border-slate-800/30 transition-colors hover:bg-slate-800/20'
                    >
                      <TableCell className='px-3 py-3'>
                        <p className='truncate font-medium text-slate-200 text-sm'>
                          {item.topic}
                        </p>
                      </TableCell>
                      <TableCell className='px-3 py-3'>
                        <RecallStrengthBadge strength={item.recall_strength} />
                      </TableCell>
                      <TableCell className='px-3 py-3'>
                        <span className='font-mono text-slate-300 text-sm tabular-nums'>
                          {Math.round(item.accuracy * 100)}%
                        </span>
                      </TableCell>
                      <TableCell className='max-w-[200px] truncate px-3 py-3 text-slate-400 text-xs'>
                        {item.common_mistake}
                      </TableCell>
                      <TableCell className='whitespace-nowrap px-3 py-3 text-slate-500 text-xs'>
                        {item.last_activity}
                      </TableCell>
                      <TableCell className='px-3 py-3'>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className='px-3 py-3'>
                        <span className='font-mono text-slate-400 text-sm tabular-nums'>
                          {Number(item.students)}
                        </span>
                      </TableCell>
                      <TableCell className='px-3 py-3'>
                        <Button
                          variant='ghost'
                          size='xs'
                          className='h-7 px-2 font-medium text-indigo-400 text-xs hover:text-indigo-300'
                          onClick={() => handleViewTopic(item.id)}
                        >
                          View Topic
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className='flex items-center justify-between pt-3'>
              <p className='text-slate-500 text-xs'>
                Page {page} of{' '}
                {Math.ceil(Number(painPoints.data.total) / limit)} (
                {Number(painPoints.data.total)} results)
              </p>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className='h-7 text-xs'
                >
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={
                    page >= Math.ceil(Number(painPoints.data.total) / limit)
                  }
                  onClick={() => setPage((p) => p + 1)}
                  className='h-7 text-xs'
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      {patternInsights.isLoading ? (
        <PatternInsightsSkeleton />
      ) : patternInsights.isError ? (
        <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
          <p className='text-red-300 text-sm'>
            {patternInsights.error?.message ||
              'Failed to load pattern insights'}
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => patternInsights.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : !patternInsights.data ||
        patternInsights.data.insights.length === 0 ? (
        <PatternInsightsEmptyState />
      ) : (
        <PatternInsightsSection insights={patternInsights.data.insights} />
      )}

      <TopicDetailDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        data={topicDetail.data}
        isLoading={topicDetail.isLoading}
      />
    </div>
  )
}
