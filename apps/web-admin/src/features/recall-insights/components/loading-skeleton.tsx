import { Skeleton } from '@/components/ui/skeleton'

export function RecallOverviewSkeleton() {
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

export function DifficultyBreakdownSkeleton() {
  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className='h-28 rounded-2xl' />
      ))}
    </div>
  )
}

export function QuestionTableSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-7 flex-1' />
        <Skeleton className='h-7 w-28' />
        <Skeleton className='h-7 w-28' />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className='h-12 w-full' />
      ))}
    </div>
  )
}

export function MissingConceptSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className='h-24 rounded-2xl' />
      ))}
    </div>
  )
}

export function MemoryGapTableSkeleton() {
  return (
    <div className='space-y-2'>
      <div className='flex gap-4 p-4'>
        <Skeleton className='h-4 w-40' />
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-4 w-36' />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className='h-12 w-full rounded-lg' />
      ))}
    </div>
  )
}

export function ActionCardSkeleton() {
  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <div className='flex items-start gap-3'>
        <Skeleton className='size-10 rounded-lg' />
        <div className='flex flex-1 flex-col gap-2'>
          <Skeleton className='h-4 w-64' />
          <Skeleton className='h-3 w-full' />
          <Skeleton className='h-3 w-3/4' />
        </div>
      </div>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-3 w-48' />
        <Skeleton className='h-8 w-32 rounded-lg' />
      </div>
    </div>
  )
}

export function TrendsChartsSkeleton() {
  return (
    <div className='grid gap-6 md:grid-cols-2'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'
        >
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-48 w-full rounded-lg' />
        </div>
      ))}
    </div>
  )
}
