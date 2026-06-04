import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const issueColors: Record<string, string> = {
  'Low Recall': 'bg-red-500/15 text-red-400 border-red-500/30',
  'Poor Accuracy': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'High Drop-off': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Weak Fundamentals': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
}

interface IssueBadgeProps {
  issue: string
}

export function IssueBadge({ issue }: IssueBadgeProps) {
  const colorClass =
    issueColors[issue] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'

  return (
    <Badge
      variant='outline'
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-semibold text-[0.65rem]',
        colorClass,
      )}
    >
      {issue}
    </Badge>
  )
}
