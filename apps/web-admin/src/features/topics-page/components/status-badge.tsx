import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
}

const statusColors: Record<string, string> = {
  healthy: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  needs_attention: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  critical: 'border-red-500/40 bg-red-500/10 text-red-400',
}

const statusLabels: Record<string, string> = {
  healthy: 'Healthy',
  needs_attention: 'Needs Attention',
  critical: 'Critical',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass =
    statusColors[status] ?? 'border-slate-500/40 bg-slate-500/10 text-slate-400'
  const label = statusLabels[status] ?? status
  return (
    <Badge variant='outline' className={`rounded-full ${colorClass}`}>
      {label}
    </Badge>
  )
}
