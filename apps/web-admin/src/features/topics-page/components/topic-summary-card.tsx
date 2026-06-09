import type { TopicSummary } from '@aspiron/api-client'
import { BookOpen, FileText, FileWarning, Target } from 'lucide-react'

interface TopicSummaryCardProps {
  summary: TopicSummary
}

const metrics = [
  {
    key: 'totalTopics',
    label: 'Total Topics',
    icon: BookOpen,
    value: (s: TopicSummary) => Number(s.total_topics),
  },
  {
    key: 'publishedTopics',
    label: 'Topics Published',
    icon: Target,
    value: (s: TopicSummary) => Number(s.published_topics),
  },
  {
    key: 'draftTopics',
    label: 'Topics In Draft',
    icon: FileText,
    value: (s: TopicSummary) => Number(s.draft_topics),
  },
  {
    key: 'weakTopics',
    label: 'Topics Flagged As Weak',
    icon: FileWarning,
    value: (s: TopicSummary) => Number(s.weak_topics),
  },
]

export function TopicSummaryCard({ summary }: TopicSummaryCardProps) {
  return (
    <div className='flex flex-wrap gap-4'>
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <div
            key={metric.key}
            className='flex flex-1 items-center gap-4 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 px-5 py-3 backdrop-blur-sm'
          >
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400'>
              <Icon className='size-4.5' />
            </div>
            <div className='min-w-0'>
              <p className='font-semibold text-2xl text-white tabular-nums'>
                {metric.value(summary)}
              </p>
              <p className='truncate text-slate-400 text-xs'>{metric.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
