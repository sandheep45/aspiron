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
            className='flex flex-1 items-center gap-4 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 px-5 py-3'
          >
            <Skeleton className='size-9 rounded-lg bg-slate-800' />
            <div className='space-y-2'>
              <Skeleton className='h-7 w-12 bg-slate-800' />
              <Skeleton className='h-3 w-24 bg-slate-800' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'insights') {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className='rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4'
          >
            <div className='mb-3 flex items-center gap-3'>
              <Skeleton className='size-8 rounded-lg bg-slate-800' />
              <Skeleton className='h-4 flex-1 bg-slate-800' />
            </div>
            <Skeleton className='h-3 w-full bg-slate-800' />
            <Skeleton className='mt-2 h-3 w-3/4 bg-slate-800' />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-4 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 px-4 py-3'
        >
          <Skeleton className='h-4 w-32 bg-slate-800' />
          <Skeleton className='h-5 w-20 bg-slate-800' />
          <Skeleton className='h-5 w-16 bg-slate-800' />
          <Skeleton className='h-5 w-16 bg-slate-800' />
          <Skeleton className='h-4 w-12 bg-slate-800' />
          <Skeleton className='h-4 w-20 bg-slate-800' />
          <Skeleton className='h-5 w-24 bg-slate-800' />
          <div className='ml-auto'>
            <Skeleton className='h-4 w-20 bg-slate-800' />
          </div>
        </div>
      ))}
    </div>
  )
}
