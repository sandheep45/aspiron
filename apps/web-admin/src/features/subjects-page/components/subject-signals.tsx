import type { SubjectSignal } from '@aspiron/api-client'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'

interface SubjectSignalsProps {
  signals: SubjectSignal[]
}

export function SubjectSignals({ signals }: SubjectSignalsProps) {
  if (signals.length === 0) {
    return (
      <section>
        <SectionHeader
          title='Subject Signals'
          description='Quick subject-level insights.'
          accent='bg-fuchsia-500'
        />
        <div className='flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-10 text-center backdrop-blur-sm'>
          <p className='text-slate-500 text-xs'>No signals available yet.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <SectionHeader
        title='Subject Signals'
        description='Quick subject-level insights.'
        accent='bg-fuchsia-500'
      />
      <div className='grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {signals.map((signal, index) => {
          const isPositive = signal.signal_type === 'positive'
          return (
            <div
              key={`${signal.subject_name}-${index}`}
              className='flex flex-col gap-3 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:shadow-indigo-500/5 hover:shadow-lg'
            >
              <div className='flex items-center gap-2.5'>
                <div
                  className={`flex size-7 items-center justify-center rounded-lg ${
                    isPositive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className='size-3.5' />
                  ) : (
                    <TrendingDown className='size-3.5' />
                  )}
                </div>
                <span className='font-semibold text-sm text-white'>
                  {signal.subject_name}
                </span>
              </div>
              <p className='text-slate-400 text-xs leading-relaxed'>
                {signal.message}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
