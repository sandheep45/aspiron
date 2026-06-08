import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RecallBadgeProps {
  value: string
}

const recallColors: Record<string, string> = {
  strong: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  weak: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export function RecallBadge({ value }: RecallBadgeProps) {
  const colorClass =
    recallColors[value] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'

  return (
    <Badge
      variant='outline'
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-semibold text-[0.65rem] capitalize',
        colorClass,
      )}
    >
      {value}
    </Badge>
  )
}
