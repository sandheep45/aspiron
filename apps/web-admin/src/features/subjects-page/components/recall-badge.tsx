import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RecallBadgeProps {
  value: number | null | undefined
}

export function RecallBadge({ value }: RecallBadgeProps) {
  if (value == null) {
    return <span className='text-slate-600 text-xs'>—</span>
  }

  const pct = value * 100
  const label = pct >= 80 ? 'Strong' : pct >= 50 ? 'Medium' : 'Weak'
  const colorClass =
    pct >= 80
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : pct >= 50
        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        : 'bg-red-500/15 text-red-400 border-red-500/30'

  return (
    <Badge
      variant='outline'
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-semibold text-[0.65rem]',
        colorClass,
      )}
    >
      {label}
    </Badge>
  )
}
