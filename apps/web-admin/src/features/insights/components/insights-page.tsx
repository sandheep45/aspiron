import type { Insight, InsightSeverity, InsightType } from '@aspiron/api-client'
import { useInsightQuery } from '@aspiron/tanstack-client'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const severityColors: Record<
  InsightSeverity,
  'destructive' | 'warning' | 'default' | 'secondary' | 'outline'
> = {
  danger: 'destructive',
  warning: 'secondary',
  success: 'default',
  info: 'outline',
  neutral: 'ghost',
}

const severityOptions: { value: string; label: string }[] = [
  { value: '', label: 'All Severities' },
  { value: 'danger', label: 'Danger' },
  { value: 'warning', label: 'Warning' },
  { value: 'success', label: 'Success' },
  { value: 'info', label: 'Info' },
  { value: 'neutral', label: 'Neutral' },
]

const typeOptions: { value: string; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'low_attendance', label: 'Low Attendance' },
  { value: 'low_engagement', label: 'Low Engagement' },
  { value: 'topic_difficulty', label: 'Topic Difficulty' },
  { value: 'quiz_review_pending', label: 'Quiz Review Pending' },
  { value: 'system_alert', label: 'System Alert' },
]

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatTypeLabel(type: InsightType): string {
  const map: Record<string, string> = {
    low_attendance: 'Attendance',
    low_engagement: 'Engagement',
    topic_difficulty: 'Difficulty',
    quiz_review_pending: 'Quiz Review',
    system_alert: 'Alert',
  }
  return map[type] ?? type
}

function InsightsTableSkeleton() {
  return (
    <div className='space-y-2'>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className='flex items-center gap-4 rounded-lg p-3'>
          <Skeleton className='h-5 w-16 rounded-full' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-48' />
          <Skeleton className='h-4 w-64' />
          <Skeleton className='h-4 w-20' />
        </div>
      ))}
    </div>
  )
}

export function InsightsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [severityFilter, setSeverityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const queryArgs = {
    page,
    limit,
    sort_by: 'detected_at' as const,
    sort_order: 'desc' as const,
    ...(severityFilter && { severity: severityFilter as InsightSeverity }),
    ...(typeFilter && { insight_type: typeFilter as InsightType }),
  }

  const { data, isLoading, isError, error } = useInsightQuery({
    args: queryArgs,
  })

  const handleSeverityChange = useCallback((value: string) => {
    setSeverityFilter(value)
    setPage(1)
  }, [])

  const handleTypeChange = useCallback((value: string) => {
    setTypeFilter(value)
    setPage(1)
  }, [])

  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Button
            variant='ghost'
            size='sm'
            nativeButton={false}
            render={<Link to='/dashboard' />}
            className='mb-1 text-slate-400'
          >
            <ChevronLeft className='mr-1 h-4 w-4' />
            Back to Dashboard
          </Button>
          <h1 className='font-semibold text-2xl text-white'>All Insights</h1>
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <div className='w-40'>
          <Select value={severityFilter} onValueChange={handleSeverityChange}>
            <SelectTrigger>
              <SelectValue placeholder='All Severities' />
            </SelectTrigger>
            <SelectContent>
              {severityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='w-44'>
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder='All Types' />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <InsightsTableSkeleton />
      ) : isError ? (
        <div className='flex flex-col items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center'>
          <p className='text-red-300 text-sm'>
            {error?.message || 'Failed to load insights'}
          </p>
          <Button variant='outline' size='sm'>
            Retry
          </Button>
        </div>
      ) : !data || data.insights.length === 0 ? (
        <div className='flex flex-col items-center gap-2 rounded-lg border border-slate-700 border-dashed p-8 text-center'>
          <p className='font-medium text-slate-300'>No insights found</p>
          <p className='text-slate-500 text-sm'>Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-20'>Severity</TableHead>
                <TableHead className='w-28'>Type</TableHead>
                <TableHead className='w-48'>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className='w-24 text-right'>Detected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.insights.map((insight: Insight) => (
                <TableRow key={insight.id}>
                  <TableCell>
                    <Badge
                      variant={
                        severityColors[insight.severity as InsightSeverity]
                      }
                    >
                      {insight.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-slate-400'>
                    {formatTypeLabel(insight.insight_type as InsightType)}
                  </TableCell>
                  <TableCell className='font-medium text-white'>
                    {insight.title}
                  </TableCell>
                  <TableCell className='max-w-md truncate text-slate-400'>
                    {insight.description}
                  </TableCell>
                  <TableCell className='text-right text-slate-500'>
                    {formatDate(insight.detected_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className='flex items-center justify-between pt-2'>
            <p className='text-slate-400 text-sm'>
              Page {data.pagination.page} of {data.pagination.total_pages} (
              {Number(data.pagination.filtered_total)} results)
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={page >= data.pagination.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
