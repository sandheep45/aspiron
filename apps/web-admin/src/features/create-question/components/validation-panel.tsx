import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { useMemo } from 'react'

interface QualityCheck {
  label: string
  pass: boolean
  message: string
}

interface ValidationPanelProps {
  checks: QualityCheck[]
}

export function ValidationPanel({ checks }: ValidationPanelProps) {
  const passed = useMemo(() => checks.filter((c) => c.pass).length, [checks])
  const total = checks.length

  return (
    <section>
      <h2 className='mb-4 font-medium text-slate-300 text-sm uppercase tracking-wide'>
        Quality Checklist
      </h2>
      <div className='flex flex-col gap-3 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
        <div className='flex items-center justify-between border-white/5 border-b pb-3'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='size-4 text-amber-400' />
            <span className='text-slate-300 text-sm'>
              Question Quality Check
            </span>
          </div>
          <span className='text-slate-500 text-xs tabular-nums'>
            {passed}/{total} passed
          </span>
        </div>
        <div className='space-y-2'>
          {checks.map((check) => (
            <div key={check.label} className='flex items-start gap-2.5'>
              {check.pass ? (
                <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-400' />
              ) : (
                <XCircle className='mt-0.5 size-4 shrink-0 text-red-400' />
              )}
              <div className='flex flex-col'>
                <span
                  className={`font-medium text-xs ${
                    check.pass ? 'text-emerald-300' : 'text-red-300'
                  }`}
                >
                  {check.label}
                </span>
                {!check.pass && (
                  <span className='text-[10px] text-red-400/70'>
                    {check.message}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
