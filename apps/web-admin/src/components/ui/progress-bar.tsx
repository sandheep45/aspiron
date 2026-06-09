import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, className, showLabel }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  const bar = (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-slate-800',
        showLabel && 'flex-1',
      )}
    >
      <div
        className='h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 ease-out'
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {bar}
        <span className='w-10 text-right font-mono text-slate-400 text-xs tabular-nums'>
          {Math.round(clampedValue)}%
        </span>
      </div>
    )
  }

  return bar
}
