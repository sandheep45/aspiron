import { Skeleton } from '@/components/ui/skeleton'

export function TopicHealthCardSkeleton() {
  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-3 w-28' />
        <Skeleton className='size-8 rounded-lg' />
      </div>
      <Skeleton className='h-6 w-20' />
      <Skeleton className='h-3 w-36' />
    </div>
  )
}

export function LearningIssueCardSkeleton() {
  return (
    <div className='flex items-start gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <Skeleton className='mt-1 size-10 shrink-0 rounded-lg' />
      <div className='flex flex-1 flex-col gap-2'>
        <Skeleton className='h-4 w-64' />
        <Skeleton className='h-3 w-full' />
        <Skeleton className='h-3 w-48' />
      </div>
      <div className='flex shrink-0 flex-col items-end gap-2'>
        <Skeleton className='h-5 w-20 rounded' />
        <Skeleton className='h-8 w-36 rounded-lg' />
      </div>
    </div>
  )
}

export function ContentComponentCardSkeleton() {
  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <div className='flex items-center gap-3'>
        <Skeleton className='size-10 rounded-lg' />
        <div className='flex flex-1 flex-col gap-1.5'>
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-3 w-20' />
        </div>
      </div>
      <Skeleton className='h-3 w-32' />
      <Skeleton className='h-8 w-full rounded-lg' />
    </div>
  )
}

export function QuickActionsSkeleton() {
  return (
    <div className='flex flex-wrap gap-3'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className='h-9 w-44 rounded-lg' />
      ))}
    </div>
  )
}

export function TrendsSkeleton() {
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
