import type { ContentDashboardSubjectProgress } from '@aspiron/api-client'
import { ProgressBar } from '@/features/content-dashboard/components/progress-bar'

interface SubjectProgressCardProps {
  subject: ContentDashboardSubjectProgress
}

export function SubjectProgressCard({ subject }: SubjectProgressCardProps) {
  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:shadow-indigo-500/5 hover:shadow-lg'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold text-sm text-white'>{subject.name}</h3>
        <span className='font-mono text-indigo-400 text-sm tabular-nums'>
          {Math.round(subject.completion)}%
        </span>
      </div>

      <ProgressBar value={subject.completion} />

      <div className='grid grid-cols-3 gap-2'>
        <div className='flex flex-col'>
          <span className='font-mono text-slate-200 text-sm tabular-nums'>
            {Number(subject.total_topics)}
          </span>
          <span className='text-[0.65rem] text-slate-500'>Total</span>
        </div>
        <div className='flex flex-col'>
          <span className='font-mono text-emerald-400 text-sm tabular-nums'>
            {Number(subject.published_topics)}
          </span>
          <span className='text-[0.65rem] text-slate-500'>Published</span>
        </div>
        <div className='flex flex-col'>
          <span className='font-mono text-amber-400 text-sm tabular-nums'>
            {Number(subject.draft_topics)}
          </span>
          <span className='text-[0.65rem] text-slate-500'>Draft</span>
        </div>
      </div>
    </div>
  )
}
