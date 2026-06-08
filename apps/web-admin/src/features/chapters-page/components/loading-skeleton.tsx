import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSkeletonProps {
  variant: 'summary' | 'table' | 'insights'
}

export function LoadingSkeleton({ variant }: LoadingSkeletonProps) {
  if (variant === 'summary') {
    return (
      <div className='flex flex-wrap gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='flex flex-1 items-center gap-4 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 px-5 py-3 backdrop-blur-sm'
          >
            <Skeleton className='size-9 shrink-0 rounded-lg' />
            <div className='min-w-0'>
              <Skeleton className='h-7 w-16' />
              <Skeleton className='mt-1 h-3 w-28' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className='flex animate-pulse items-center gap-4 rounded-lg border border-white/5 p-4'
          >
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-2 flex-1 rounded-full' />
            <Skeleton className='h-5 w-14 rounded-full' />
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-5 w-20 rounded-full' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-6 w-28 rounded-lg' />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col gap-3 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'
        >
          <div className='flex items-center gap-2.5'>
            <Skeleton className='size-7 rounded-lg' />
            <Skeleton className='h-4 w-32' />
          </div>
          <Skeleton className='h-3 w-full' />
        </div>
      ))}
    </div>
  )
}
