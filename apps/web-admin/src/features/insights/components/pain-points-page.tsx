import type {
  TopicPerformance,
  TopicPerformanceSortBy,
} from '@aspiron/api-client'
import { useTopicPerformanceQuery } from '@aspiron/tanstack-client'
import { Link } from '@tanstack/react-router'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { Skeleton } from '@/components/ui/skeleton'

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

const columns: ColumnDef<TopicPerformance>[] = [
  {
    accessorKey: 'topic_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Topic Name' />
    ),
    cell: ({ row }) => {
      const topic = row.original
      return (
        <div>
          <p className='font-medium text-white'>{topic.topic_name}</p>
          <p className='text-slate-400 text-sm'>
            {topic.chapter_name} &middot; {topic.subject_name}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'recall_strength_mcq',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Recall' />
    ),
    cell: ({ row }) => {
      const value = row.getValue<number | null>('recall_strength_mcq')
      return (
        <span className='text-slate-400'>
          {value != null ? formatPercent(value) : '—'}
        </span>
      )
    },
  },
  {
    accessorKey: 'practice_accuracy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Accuracy' />
    ),
    cell: ({ row }) => (
      <span className='text-slate-400'>
        {formatPercent(row.getValue<number>('practice_accuracy'))}
      </span>
    ),
  },
  {
    accessorKey: 'students_affected',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Students' />
    ),
    cell: ({ row }) => {
      const topic = row.original
      return (
        <span className='text-slate-400'>
          {String(topic.students_affected)}/{String(topic.total_students)}
        </span>
      )
    },
  },
  {
    id: 'status',
    accessorKey: 'practice_accuracy',
    header: 'Status',
    cell: ({ row }) => {
      const badge = getStatusBadge(row.getValue<number>('practice_accuracy'))
      return <Badge variant={badge.variant}>{badge.label}</Badge>
    },
    enableSorting: false,
  },
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

const sortFieldMap: Record<string, TopicPerformanceSortBy> = {
  topic_name: 'topic_name',
  recall_strength_mcq: 'recall_strength_mcq',
  practice_accuracy: 'practice_accuracy',
  students_affected: 'students_affected',
}

export function PainPointsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'practice_accuracy', desc: false },
  ])

  const sortBy = sortFieldMap[sorting[0]?.id] ?? 'practice_accuracy'
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc'

  const queryArgs = {
    page,
    limit,
    sort_by: sortBy,
    sort_order: sortOrder,
  }

  const { data, isLoading, isError, error, refetch } = useTopicPerformanceQuery(
    {
      args: queryArgs,
    },
  )

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting)
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

      {isLoading ? (
        <PainPointsTableSkeleton />
      ) : isError ? (
        <div className='flex flex-col items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center'>
          <p className='text-red-300 text-sm'>
            {error?.message || 'Failed to load topic data'}
          </p>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
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
          <DataTable
            columns={columns}
            data={data.topics}
            sorting={sorting}
            onSortingChange={handleSortingChange}
          />

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
