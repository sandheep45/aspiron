export function OverviewCardSkeleton() {
  return (
    <div className='flex animate-pulse flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 backdrop-blur-sm'>
      <div className='flex items-center gap-3'>
        <div className='size-10 rounded-lg bg-slate-800' />
        <div className='flex flex-1 flex-col gap-1.5'>
          <div className='h-4 w-32 rounded bg-slate-800' />
          <div className='h-3 w-24 rounded bg-slate-800' />
        </div>
      </div>
      <div className='grid grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='flex flex-col gap-2 rounded-xl bg-slate-800/50 p-4'
          >
            <div className='h-3 w-20 rounded bg-slate-700' />
            <div className='h-6 w-12 rounded bg-slate-700' />
          </div>
        ))}
      </div>
    </div>
  )
}

export function EditorSkeleton() {
  return (
    <div className='flex animate-pulse flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 backdrop-blur-sm'>
      <div className='flex items-center gap-3'>
        <div className='h-5 w-28 rounded bg-slate-800' />
        <div className='h-5 w-20 rounded-full bg-slate-800' />
      </div>
      <div className='flex items-center gap-1 rounded-lg bg-slate-800/50 p-2'>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className='size-7 rounded bg-slate-700' />
        ))}
      </div>
      <div className='flex flex-col gap-3 rounded-lg bg-slate-800/30 p-4'>
        <div className='h-4 w-full rounded bg-slate-800' />
        <div className='h-4 w-3/4 rounded bg-slate-800' />
        <div className='h-4 w-5/6 rounded bg-slate-800' />
        <div className='h-4 w-2/3 rounded bg-slate-800' />
        <div className='h-4 w-full rounded bg-slate-800' />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className='animate-pulse rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 backdrop-blur-sm'>
      <div className='flex items-center justify-between'>
        <div className='h-5 w-40 rounded bg-slate-800' />
        <div className='h-7 w-28 rounded bg-slate-800' />
      </div>
      <div className='mt-4 space-y-3'>
        <div className='flex gap-4 rounded-lg bg-slate-800/30 p-3'>
          <div className='h-3 w-1/3 rounded bg-slate-700' />
          <div className='h-3 w-1/4 rounded bg-slate-700' />
          <div className='h-3 w-20 rounded bg-slate-700' />
          <div className='h-3 w-16 rounded bg-slate-700' />
          <div className='h-3 w-24 rounded bg-slate-700' />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className='flex gap-4 rounded-lg p-3'>
            <div className='h-3 w-1/3 rounded bg-slate-800' />
            <div className='h-3 w-1/4 rounded bg-slate-800' />
            <div className='h-3 w-20 rounded bg-slate-800' />
            <div className='h-3 w-16 rounded bg-slate-800' />
            <div className='flex gap-2'>
              <div className='size-6 rounded bg-slate-800' />
              <div className='size-6 rounded bg-slate-800' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
