import type { NotesOverview } from '@aspiron/api-client'
import { BookOpen, FileText, Link, Users } from 'lucide-react'

interface NotesOverviewCardProps {
  data: NotesOverview
  loading?: boolean
}

function capitalize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const metrics = [
  {
    label: 'Teacher Notes',
    icon: BookOpen,
    iconBg: 'bg-purple-500/10 text-purple-400',
    getValue: (d: NotesOverview) => capitalize(d.teacher_notes_status),
    supporting: 'Status',
  },
  {
    label: 'AI Notes',
    icon: FileText,
    iconBg: 'bg-sky-500/10 text-sky-400',
    getValue: (d: NotesOverview) => capitalize(d.ai_notes_status),
    supporting: 'Status',
  },
  {
    label: 'External References',
    icon: Link,
    iconBg: 'bg-amber-500/10 text-amber-400',
    getValue: (d: NotesOverview) => `${d.external_references_count} Linked`,
    supporting: 'Resources',
  },
  {
    label: 'Student Engagement',
    icon: Users,
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    getValue: (d: NotesOverview) => `${d.student_engagement}%`,
    supporting: 'Viewed',
  },
]

export function NotesOverviewCard({ data, loading }: NotesOverviewCardProps) {
  if (loading) {
    return (
      <div className='flex animate-pulse flex-col divide-y divide-white/[0.05] rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-sm sm:flex-row sm:divide-x sm:divide-y-0'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='flex flex-1 flex-col justify-center gap-1.5 px-6 py-6'
          >
            <div className='flex items-center gap-2'>
              <div className='size-5 rounded bg-slate-800' />
              <div className='h-3 w-20 rounded bg-slate-800' />
            </div>
            <div className='h-7 w-16 rounded bg-slate-800' />
            <div className='h-3 w-12 rounded bg-slate-800' />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='flex flex-col divide-y divide-white/[0.05] rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-sm sm:flex-row sm:divide-x sm:divide-y-0'>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className='flex flex-1 flex-col justify-center gap-1 px-6 py-6'
        >
          <div className='flex items-center gap-1.5'>
            <div
              className={`flex size-5 items-center justify-center rounded-md ${metric.iconBg}`}
            >
              <metric.icon className='size-3' />
            </div>
            <span className='text-slate-400 text-xs'>{metric.label}</span>
          </div>
          <span className='font-semibold text-3xl text-white tracking-tight'>
            {metric.getValue(data)}
          </span>
          <span className='text-slate-500 text-xs'>{metric.supporting}</span>
        </div>
      ))}
    </div>
  )
}
