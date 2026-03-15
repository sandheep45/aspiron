import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

const cardVariants = cva('group flex flex-col transition-all', {
  variants: {
    variant: {
      default:
        'gap-4 overflow-hidden rounded-lg bg-card py-4 text-card-foreground ring-1 ring-foreground/10',
      elevated:
        'bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/5',
    },
    size: {
      default: '',
      sm: 'gap-3 py-3',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export interface CardProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof cardVariants> {
  loading?: boolean
}

function Card({
  className,
  size,
  variant,
  loading,
  children,
  ...props
}: CardProps) {
  return (
    <div
      data-slot='card'
      data-size={size}
      className={cn(
        cardVariants({ variant, size }),
        'relative', // needed for overlay
        className,
      )}
      {...props}
    >
      {/* Optional loading overlay */}
      {loading && (
        <div className='absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm dark:bg-black/30'>
          <Spinner className='size-10' />
        </div>
      )}

      <div className={cn(loading ? 'pointer-events-none opacity-50' : '')}>
        {children}
      </div>
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-header'
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-title'
      className={cn('font-medium text-sm', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-description'
      className={cn('text-muted-foreground text-xs/relaxed', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-action'
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-content'
      className={cn('px-4 group-data-[size=sm]/card:px-3', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-footer'
      className={cn(
        'flex items-center rounded-b-lg px-4 group-data-[size=sm]/card:px-3 [.border-t]:pt-4 group-data-[size=sm]/card:[.border-t]:pt-3',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
