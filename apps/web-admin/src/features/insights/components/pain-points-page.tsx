import type {
  TopicPerformance,
  TopicPerformanceSortBy,
} from '@aspiron/api-client'
import { useTopicPerformanceQuery } from '@aspiron/tanstack-client'
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

function getStatusBadge(accuracy: number) {
  if (accuracy < 0.4) {
    return { label: 'Weak', variant: 'destructive' as const }
  }
  if (accuracy < 0.7) {
    return { label: 'Medium', variant: 'secondary' as const }
  }
  return { label: 'Strong', variant: 'default' as const }
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

const sortOptions: { value: string; label: string }[] = [
  { value: 'practice_accuracy', label: 'Accuracy' },
  { value: 'topic_name', label: 'Topic Name' },
  { value: 'recall_strength_mcq', label: 'Recall Strength' },
  { value: 'students_affected', label: 'Students Affected' },
]

function PainPointsTableSkeleton() {
  return (
    <div className='space-y-2'>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className='flex items-center gap-4 rounded-lg p-3'>
          <Skeleton className='h-4 w-48' />
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-5 w-16 rounded-full' />
        </div>
      ))}
    </div>
  )
}

export function PainPointsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [sortBy, setSortBy] =
    useState<TopicPerformanceSortBy>('practice_accuracy')

  const queryArgs = {
    page,
    limit,
    sort_by: sortBy,
    sort_order: 'asc' as const,
  }

  const { data, isLoading, isError, error } = useTopicPerformanceQuery({
    args: queryArgs,
  })

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as TopicPerformanceSortBy)
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
          <h1 className='font-semibold text-2xl text-white'>
            Student Pain Points
          </h1>
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <div className='w-40'>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
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

      {isLoading ? (
        <PainPointsTableSkeleton />
      ) : isError ? (
        <div className='flex flex-col items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center'>
          <p className='text-red-300 text-sm'>
            {error?.message || 'Failed to load topic data'}
          </p>
          <Button variant='outline' size='sm'>
            Retry
          </Button>
        </div>
      ) : !data || data.topics.length === 0 ? (
        <div className='flex flex-col items-center gap-2 rounded-lg border border-slate-700 border-dashed p-8 text-center'>
          <p className='font-medium text-slate-300'>No topic data found</p>
          <p className='text-slate-500 text-sm'>
            Data appears once students complete recall sessions.
          </p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-64'>Topic Name</TableHead>
                <TableHead className='w-28'>Recall</TableHead>
                <TableHead className='w-28'>Accuracy</TableHead>
                <TableHead className='w-24'>Students</TableHead>
                <TableHead className='w-20'>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topics.map((topic: TopicPerformance) => {
                const badge = getStatusBadge(topic.practice_accuracy)
                return (
                  <TableRow key={topic.topic_id}>
                    <TableCell>
                      <p className='font-medium text-white'>
                        {topic.topic_name}
                      </p>
                      <p className='text-slate-400 text-sm'>
                        {topic.chapter_name} &middot; {topic.subject_name}
                      </p>
                    </TableCell>
                    <TableCell className='text-slate-400'>
                      {topic.recall_strength_mcq != null
                        ? formatPercent(topic.recall_strength_mcq)
                        : '—'}
                    </TableCell>
                    <TableCell className='text-slate-400'>
                      {formatPercent(topic.practice_accuracy)}
                    </TableCell>
                    <TableCell className='text-slate-400'>
                      {String(topic.students_affected)}/
                      {String(topic.total_students)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
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
