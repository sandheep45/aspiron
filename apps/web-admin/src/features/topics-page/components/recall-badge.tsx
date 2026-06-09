import { Badge } from '@/components/ui/badge'

interface RecallBadgeProps {
  value: string
}

const recallColors: Record<string, string> = {
  strong: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  medium: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  weak: 'border-red-500/40 bg-red-500/10 text-red-400',
}

export function RecallBadge({ value }: RecallBadgeProps) {
  const colorClass =
    recallColors[value] ?? 'border-slate-500/40 bg-slate-500/10 text-slate-400'
  return (
    <Badge variant='outline' className={`rounded-full ${colorClass}`}>
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </Badge>
  )
}
