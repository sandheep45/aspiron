import { Skeleton } from '@/components/ui/skeleton'

export function MetricCardSkeleton() {
  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-3 w-28' />
        <Skeleton className='size-8 rounded-lg' />
      </div>
      <Skeleton className='h-8 w-16' />
      <Skeleton className='h-3 w-40' />
    </div>
  )
}

export function AttentionTableSkeleton() {
  return (
    <div className='space-y-2'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-4 rounded-lg border border-white/5 p-4'
        >
          <Skeleton className='h-4 w-48' />
          <Skeleton className='h-5 w-24 rounded-full' />
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-6 w-20 rounded-lg' />
        </div>
      ))}
    </div>
  )
}

export function SubjectProgressSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'
        >
          <Skeleton className='h-4 w-32' />
          <div className='flex items-center gap-3'>
            <Skeleton className='h-2 flex-1 rounded-full' />
            <Skeleton className='h-4 w-10' />
          </div>
          <div className='grid grid-cols-3 gap-2'>
            <Skeleton className='h-3 w-full' />
            <Skeleton className='h-3 w-full' />
            <Skeleton className='h-3 w-full' />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SignalsSectionSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'
        >
          <div className='flex items-center gap-2'>
            <Skeleton className='size-5 rounded-lg' />
            <Skeleton className='h-4 w-48' />
          </div>
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className='flex items-center justify-between'>
              <Skeleton className='h-3 w-56' />
              <Skeleton className='h-3 w-12' />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
