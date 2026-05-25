import { createFileRoute } from '@tanstack/react-router'
import { ActionRequired } from '@/features/dashboard/components/action-required'
import { StudentPainPoints } from '@/features/dashboard/components/student-pain-points'
import { SystemHealth } from '@/features/dashboard/components/system-health'
import { UpcomingClasses } from '@/features/dashboard/components/upcoming-classes'

export const Route = createFileRoute('/_private-routes/dashboard/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: undefined,
  },
})

function RouteComponent() {
  return (
    <div className='flex w-full flex-col gap-6'>
      <section>
        <SystemHealth />
      </section>

      <section>
        <ActionRequired />
      </section>

      <section>
        <StudentPainPoints />
      </section>

      <section>
        <UpcomingClasses />
      </section>
    </div>
  )
}
