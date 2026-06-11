import { Skeleton } from '@/components/ui/skeleton'

export function OverviewSkeleton() {
  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/50 p-4'
        >
          <Skeleton className='h-3 w-28' />
          <Skeleton className='h-6 w-16' />
          <Skeleton className='h-3 w-20' />
        </div>
      ))}
    </div>
  )
}

export function QuestionsTableSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-7 flex-1' />
        <Skeleton className='h-7 w-28' />
        <Skeleton className='h-7 w-28' />
        <Skeleton className='h-7 w-28' />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className='h-12 w-full' />
      ))}
    </div>
  )
}

export function TopicTestCardSkeleton() {
  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm sm:flex-row sm:items-center'>
      <div className='flex flex-1 flex-col gap-2'>
        <Skeleton className='h-5 w-48' />
        <Skeleton className='h-4 w-24' />
      </div>
      <div className='flex gap-6'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='flex flex-col items-center gap-1'>
            <Skeleton className='h-6 w-12' />
            <Skeleton className='h-3 w-16' />
          </div>
        ))}
      </div>
      <div className='flex gap-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='size-8 rounded-md' />
        ))}
      </div>
    </div>
  )
}

export function SignalsSkeleton() {
  return (
    <div className='grid gap-3 md:grid-cols-2'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className='h-20 rounded-2xl' />
      ))}
    </div>
  )
}

export function QuickActionsSkeleton() {
  return (
    <div className='flex flex-wrap gap-3'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className='h-9 w-36 rounded-md' />
      ))}
    </div>
  )
}
