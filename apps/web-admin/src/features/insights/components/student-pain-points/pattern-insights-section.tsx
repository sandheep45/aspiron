import type { PatternInsight } from '@aspiron/api-client'
import { Lightbulb } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'

interface PatternInsightsSectionProps {
  insights: PatternInsight[]
}

export function PatternInsightsSection({
  insights,
}: PatternInsightsSectionProps) {
  return (
    <section>
      <SectionHeader
        title='Pattern Insights'
        description='Recurring trends detected across struggling students.'
        accent='bg-violet-500'
      />

      <div className='grid gap-4 md:grid-cols-2'>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className='group flex items-start gap-4 rounded-2xl border border-slate-800/40 bg-gradient-to-br from-slate-900/60 to-slate-900/30 p-5 backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:shadow-indigo-500/5 hover:shadow-lg'
          >
            <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-500/20'>
              <Lightbulb className='size-4' />
            </div>
            <div className='flex flex-col gap-1'>
              <p className='font-medium text-slate-200 text-sm leading-snug'>
                {insight.title}
              </p>
              <p className='font-medium text-indigo-400/80 text-xs'>
                {insight.metric}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function PatternInsightsEmptyState() {
  return (
    <div className='flex flex-col items-center gap-3 rounded-2xl border border-slate-800/40 bg-slate-900/20 p-10 text-center backdrop-blur-sm'>
      <div className='flex size-12 items-center justify-center rounded-full bg-slate-800/50'>
        <Lightbulb className='size-6 text-slate-500' />
      </div>
      <div>
        <p className='font-medium text-slate-300 text-sm'>
          No patterns detected yet
        </p>
        <p className='mt-1 text-slate-500 text-xs'>
          Insights will appear once sufficient student data is collected.
        </p>
      </div>
    </div>
  )
}
