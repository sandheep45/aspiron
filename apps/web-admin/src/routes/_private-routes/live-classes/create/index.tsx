import { createFileRoute } from '@tanstack/react-router'
import { CreateClassPage } from '@/features/live-classes'

export const Route = createFileRoute('/_private-routes/live-classes/create/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Create Class',
  },
})

function RouteComponent() {
  return <CreateClassPage />
}
