import { useUpcomingClassesQuery } from '@aspiron/tanstack-client'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardModule } from '@/features/dashboard/components/dashboard-module'
import { CardSkeleton } from '@/features/dashboard/components/dashboard-skeletons'

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

export function UpcomingClasses() {
  const classQuery = useUpcomingClassesQuery({ args: { page: 1, limit: 5 } })

  return (
    <DashboardModule
      title='Upcoming Classes'
      sectionId='upcoming-classes'
      headerAction={
        <Button
          variant='ghost'
          className='h-8 gap-1.5 px-3 font-medium text-indigo-400 text-sm hover:text-indigo-300'
          nativeButton={false}
          render={<Link to='/live-classes' />}
        >
          View All
          <ArrowRight className='size-4' />
        </Button>
      }
      query={classQuery}
      skeleton={<CardSkeleton />}
      empty={{
        title: 'No upcoming classes scheduled',
        description: 'Create a live class to get started.',
        action: {
          label: 'Schedule a Class',
          onClick: () => {},
        },
      }}
      isEmpty={(data) => !data?.classes?.length}
      render={(data) => (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {data.classes.map((classItem) => {
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
                    <span
                      data-testid='status-label'
                      className='inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-0.5 font-medium text-xs'
                    >
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
      )}
    />
  )
}
