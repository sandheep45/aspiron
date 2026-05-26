import { useUpcomingClassesQuery } from '@aspiron/tanstack-client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type ClassStatus = 'live' | 'upcoming' | 'completed'

function getClassStatus(scheduledAt: Date, durationMin: number): ClassStatus {
  const now = new Date()
  const start = new Date(scheduledAt)
  const end = new Date(start.getTime() + durationMin * 60 * 1000)

  if (now >= start && now <= end) return 'live'
  if (now < start) return 'upcoming'
  return 'completed'
}

function formatClassTime(scheduledAt: Date) {
  const date = new Date(scheduledAt)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (diffHours < 0) {
    return `${timeStr}`
  }
  if (diffHours < 1) {
    const mins = Math.round(diffMs / (1000 * 60))
    return `in ${mins}m`
  }
  if (diffHours < 24) {
    return `${timeStr} (in ${diffHours}h)`
  }

  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return `${dateStr} ${timeStr}`
}

const statusConfig: Record<
  ClassStatus,
  { label: string; dotClass: string; cta: string }
> = {
  live: { label: 'Live', dotClass: 'bg-green-500', cta: 'Launch' },
  upcoming: { label: 'Upcoming', dotClass: 'bg-yellow-500', cta: 'View' },
  completed: { label: 'Completed', dotClass: 'bg-slate-500', cta: 'View' },
}

function LiveClassesGridSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='rounded-xl border border-slate-800 p-4'>
          <Skeleton className='mb-2 h-5 w-32' />
          <Skeleton className='mb-3 h-4 w-24' />
          <Skeleton className='mb-4 h-3 w-16' />
          <Skeleton className='h-9 w-full rounded-lg' />
        </div>
      ))}
    </div>
  )
}

export function LiveClassesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(9)

  const { data, isLoading, isError, error, refetch } = useUpcomingClassesQuery({
    args: { page, limit },
  })

  const totalItems = data?.pagination?.total ?? 0
  const totalPages = data?.pagination?.total_pages ?? 1

  return (
    <div className='flex w-full flex-col gap-6'>
      <div>
        <h1 className='font-semibold text-2xl text-white'>Live Classes</h1>
      </div>

      {isLoading ? (
        <LiveClassesGridSkeleton />
      ) : isError ? (
        <div className='flex flex-col items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center'>
          <p className='text-red-300 text-sm'>
            {error?.message || 'Failed to load live classes'}
          </p>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : totalItems === 0 ? (
        <div className='flex flex-col items-center gap-2 rounded-lg border border-slate-700 border-dashed p-8 text-center'>
          <p className='font-medium text-slate-300'>
            No upcoming classes scheduled
          </p>
          <p className='text-slate-500 text-sm'>
            Create a live class to get started.
          </p>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {data?.classes.map((classItem) => {
              const status = getClassStatus(
                classItem.scheduled_at,
                classItem.duration_min,
              )
              const config = statusConfig[status]
              return (
                <Card key={classItem.id} data-testid='class-card'>
                  <CardContent className='flex flex-col gap-3 p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate font-medium text-white'>
                          {classItem.provider}
                        </p>
                        <p className='text-slate-400 text-sm'>
                          {formatClassTime(classItem.scheduled_at)}
                        </p>
                      </div>
                      <span className='inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-0.5 font-medium text-xs'>
                        <span
                          className={`size-1.5 rounded-full ${config.dotClass}`}
                        />
                        {config.label}
                      </span>
                    </div>
                    <p className='text-slate-500 text-xs'>
                      {classItem.duration_min} min
                    </p>
                    <Button variant='brand' size='sm' className='w-full'>
                      {config.cta}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className='flex items-center justify-between pt-2'>
            <p className='text-slate-400 text-sm'>
              Page {page} of {totalPages} ({totalItems} total)
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
                disabled={page >= totalPages}
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
