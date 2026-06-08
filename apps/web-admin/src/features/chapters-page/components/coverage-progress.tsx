import { cn } from '@/lib/utils'

interface CoverageProgressProps {
  value: number
  className?: string
}

export function CoverageProgress({ value, className }: CoverageProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className='relative h-2 flex-1 overflow-hidden rounded-full bg-slate-800'>
        <div
          className='h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 ease-out'
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      <span className='w-10 text-right font-mono text-slate-400 text-xs tabular-nums'>
        {Math.round(clampedValue)}%
      </span>
    </div>
  )
}
