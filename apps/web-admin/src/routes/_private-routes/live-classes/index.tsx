import { createFileRoute } from '@tanstack/react-router'
import { LiveClassesPage } from '@/features/live-classes'

export const Route = createFileRoute('/_private-routes/live-classes/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Live Classes',
  },
})

function RouteComponent() {
  return <LiveClassesPage />
}
