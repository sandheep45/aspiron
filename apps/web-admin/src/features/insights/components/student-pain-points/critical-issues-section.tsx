import type { CriticalIssue, IssueSeverity } from '@aspiron/api-client'
import {
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  painPointCardVariants,
  painPointIconVariants,
} from '@/features/insights/components/student-pain-points/card-variants'
import { cn } from '@/lib/utils'

interface CriticalIssuesSectionProps {
  issues: CriticalIssue[]
  totalUrgent: number
  onViewTopic: (id: string) => void
}

const badgeStyles: Record<IssueSeverity, string> = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

function severityIcon(severity: IssueSeverity) {
  switch (severity) {
    case 'critical':
      return <TrendingDown className='size-5' />
    case 'high':
      return <AlertTriangle className='size-5' />
    default:
      return <TrendingUp className='size-5' />
  }
}

export function CriticalIssuesSection({
  issues,
  totalUrgent,
  onViewTopic,
}: CriticalIssuesSectionProps) {
  return (
    <section>
      <div className='mb-4 flex items-center gap-3'>
        <h2 className='font-semibold text-lg text-white'>Critical Issues</h2>
        <Badge
          variant='destructive'
          className='rounded-md px-2.5 py-0.5 font-semibold text-[0.7rem]'
        >
          {totalUrgent} urgent
        </Badge>
      </div>

      <div className='grid gap-3'>
        {issues.map((issue) => {
          return (
            <div
              key={issue.id}
              className={cn(
                painPointCardVariants({ severity: issue.severity }),
              )}
            >
              <div
                className={cn(
                  painPointIconVariants({ severity: issue.severity }),
                )}
              >
                {severityIcon(issue.severity)}
              </div>

              <div className='flex min-w-0 flex-1 flex-col gap-1'>
                <p className='truncate font-medium text-sm text-white'>
                  {issue.topic}
                </p>
                <p className='truncate text-slate-400 text-xs'>
                  {issue.description}
                </p>
                <div className='mt-1'>
                  <Button
                    variant='ghost'
                    size='xs'
                    className='h-6 gap-1 px-2 font-medium text-indigo-400 hover:text-indigo-300'
                    onClick={() => onViewTopic(issue.id)}
                  >
                    {issue.action_label}
                    <ArrowRight className='size-3' />
                  </Button>
                </div>
              </div>

              <div className='flex shrink-0 flex-col items-end gap-1.5'>
                <Badge
                  variant='outline'
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 font-semibold text-[0.65rem]',
                    badgeStyles[issue.severity],
                  )}
                >
                  {issue.severity}
                </Badge>
                <span className='whitespace-nowrap text-slate-400 text-xs'>
                  {Number(issue.students_affected)} students affected
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function CriticalIssuesEmptyState() {
  return (
    <div className='flex flex-col items-center gap-3 rounded-2xl border border-slate-800/40 bg-slate-900/20 p-10 text-center backdrop-blur-sm'>
      <div className='flex size-12 items-center justify-center rounded-full bg-emerald-500/10'>
        <TrendingUp className='size-6 text-emerald-400' />
      </div>
      <div>
        <p className='font-medium text-slate-200 text-sm'>No Critical Issues</p>
        <p className='mt-1 text-slate-500 text-xs'>
          No urgent learning bottlenecks detected.
        </p>
      </div>
    </div>
  )
}
