import { Skeleton } from '@/components/ui/skeleton'

export function InsightSkeleton() {
  return (
    <div className='grid grid-cols-2 gap-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className='flex items-start gap-5 rounded-xl border border-slate-800 bg-slate-900/50 p-5'
        >
          <Skeleton className='h-14 w-14 rounded-xl' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-5 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='mt-3 h-8 w-24 rounded-md' />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className='grid grid-cols-4 gap-3'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className='space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4'
        >
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-8 w-16' />
          <Skeleton className='h-3 w-12' />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className='space-y-2'>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/30 p-4'
        >
          <Skeleton className='h-4 w-1/4' />
          <Skeleton className='h-4 w-1/6' />
          <Skeleton className='h-4 w-1/6' />
          <Skeleton className='h-4 w-1/6' />
          <Skeleton className='h-6 w-16 rounded-full' />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className='grid grid-cols-3 gap-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className='space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4'
        >
          <Skeleton className='h-5 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
          <Skeleton className='h-3 w-1/3' />
          <Skeleton className='mt-2 h-8 w-20 rounded-md' />
        </div>
      ))}
    </div>
  )
}
