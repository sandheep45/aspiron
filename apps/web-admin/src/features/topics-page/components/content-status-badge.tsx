import { Badge } from '@/components/ui/badge'

interface ContentStatusBadgeProps {
  status: string
}

const statusConfig: Record<string, { className: string; label: string }> = {
  published: {
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    label: 'Published',
  },
  draft: {
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    label: 'Draft',
  },
  review_pending: {
    className: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
    label: 'Review Pending',
  },
  archived: {
    className: 'border-slate-500/40 bg-slate-500/10 text-slate-400',
    label: 'Archived',
  },
}

export function ContentStatusBadge({ status }: ContentStatusBadgeProps) {
  const config = statusConfig[status]
  if (!config) {
    return (
      <Badge
        variant='outline'
        className='border-slate-500/40 bg-slate-500/10 text-slate-400'
      >
        {status}
      </Badge>
    )
  }
  return (
    <Badge variant='outline' className={config.className}>
      {config.label}
    </Badge>
  )
}
