import { createFileRoute } from '@tanstack/react-router'
import { ActionRequired } from '@/modules/dashboard/components/action-required'

export const Route = createFileRoute('/_private-routes/dashboard/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: undefined,
  },
})

function RouteComponent() {
  return (
    <div className='flex w-full flex-col gap-4'>
      <p className='text-lg text-slate-400'>
        What needs your attention right now
      </p>

      <section>
        <ActionRequired />
      </section>
    </div>
  )
}
