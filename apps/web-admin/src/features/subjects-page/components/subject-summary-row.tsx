import type { SubjectSummary } from '@aspiron/api-client'
import { AlertTriangle, BookOpen, CheckCircle, FileText } from 'lucide-react'

interface SubjectSummaryRowProps {
  summary: SubjectSummary
}

const metricConfig = [
  {
    icon: BookOpen,
    label: 'Total Subjects',
    valueKey: 'total_subjects' as const,
    descIndex: 0,
  },
  {
    icon: FileText,
    label: 'Total Topics',
    valueKey: 'total_topics' as const,
    descIndex: 1,
  },
  {
    icon: CheckCircle,
    label: 'Published Topics',
    valueKey: 'published_topics' as const,
    descIndex: 2,
  },
  {
    icon: AlertTriangle,
    label: 'Topics Needing Attention',
    valueKey: 'topics_needing_attention' as const,
    descIndex: 3,
  },
]

export function SubjectSummaryRow({ summary }: SubjectSummaryRowProps) {
  return (
    <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {metricConfig.map((item) => {
        const value = Number(summary[item.valueKey])
        const description = summary.descriptions?.[item.descIndex] ?? ''
        return (
          <div
            key={item.label}
            className='flex min-w-0 flex-col gap-1 overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/40 px-5 py-3 backdrop-blur-sm transition-all duration-200 hover:border-indigo-500/10'
          >
            <p className='text-slate-500 text-xs'>{item.label}</p>
            <div className='flex items-center gap-2'>
              <div className='flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400'>
                <item.icon className='size-4' />
              </div>
              <p className='font-semibold text-2xl text-white tabular-nums tracking-tight'>
                {value}
              </p>
            </div>
            <p
              className='truncate text-[0.65rem] text-slate-500/50'
              title={description}
            >
              {description}
            </p>
          </div>
        )
      })}
    </div>
  )
}
