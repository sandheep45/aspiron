import { Skeleton } from '@/components/ui/skeleton'

export function CriticalIssuesSkeleton() {
  return (
    <div className='grid gap-4'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-4 rounded-2xl border border-slate-800/20 p-5'
        >
          <Skeleton className='size-10 shrink-0 rounded-xl' />
          <div className='flex flex-1 flex-col gap-2'>
            <Skeleton className='h-4 w-64' />
            <Skeleton className='h-3 w-48' />
            <Skeleton className='mt-1 h-6 w-24 rounded-lg' />
          </div>
          <div className='flex flex-col items-end gap-2'>
            <Skeleton className='h-5 w-20 rounded-full' />
            <Skeleton className='h-3 w-16' />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PainPointsTableSkeleton() {
  return (
    <div className='space-y-2'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-4 rounded-lg border border-slate-800/50 p-4'
        >
          <Skeleton className='h-4 w-56' />
          <Skeleton className='h-5 w-16 rounded-full' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-5 w-20 rounded-full' />
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-6 w-20 rounded-lg' />
        </div>
      ))}
    </div>
  )
}

export function PatternInsightsSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className='flex items-start gap-4 rounded-2xl border border-slate-800/50 bg-slate-900/30 p-5'
        >
          <Skeleton className='mt-0.5 size-8 shrink-0 rounded-lg' />
          <div className='flex flex-1 flex-col gap-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-3 w-3/4' />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TopicDetailSkeleton() {
  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-8 w-8 rounded-lg' />
        <div className='flex flex-col gap-1.5'>
          <Skeleton className='h-4 w-48' />
          <Skeleton className='h-3 w-32' />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='flex flex-col gap-2'>
          <Skeleton className='h-4 w-32' />
          <div className='flex flex-wrap gap-2'>
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className='h-7 w-28 rounded-lg' />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
