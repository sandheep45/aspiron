import { cva, type VariantProps } from 'class-variance-authority'

export const painPointCardVariants = cva(
  'group flex items-center gap-4 rounded-2xl border p-5 backdrop-blur-sm transition-all duration-200',
  {
    variants: {
      severity: {
        critical:
          'bg-gradient-to-br from-red-500/8 to-red-500/3 border-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-red-500/40 hover:shadow-[0_0_24px_rgba(239,68,68,0.18)] hover:-translate-y-0.5',
        high: 'bg-gradient-to-br from-amber-500/8 to-amber-500/3 border-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-500/40 hover:shadow-[0_0_24px_rgba(245,158,11,0.18)] hover:-translate-y-0.5',
        medium:
          'bg-gradient-to-br from-yellow-500/8 to-yellow-500/3 border-yellow-500/25 shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:border-yellow-500/40 hover:shadow-[0_0_24px_rgba(251,191,36,0.18)] hover:-translate-y-0.5',
        low: 'bg-gradient-to-br from-blue-500/8 to-blue-500/3 border-blue-500/25 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/40 hover:shadow-[0_0_24px_rgba(59,130,246,0.18)] hover:-translate-y-0.5',
      },
    },
    defaultVariants: {
      severity: 'low',
    },
  },
)

export type PainPointCardVariantsProps = VariantProps<
  typeof painPointCardVariants
>

export const painPointIconVariants = cva(
  'flex size-10 shrink-0 items-center justify-center rounded-xl',
  {
    variants: {
      severity: {
        critical: 'bg-red-500/[0.12] text-red-400',
        high: 'bg-amber-500/[0.12] text-orange-400',
        medium: 'bg-yellow-500/[0.12] text-yellow-400',
        low: 'bg-blue-500/[0.12] text-blue-400',
      },
    },
    defaultVariants: {
      severity: 'low',
    },
  },
)

export type PainPointIconVariantsProps = VariantProps<
  typeof painPointIconVariants
>
