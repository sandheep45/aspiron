import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-routes/live-classes/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Live Classes',
  },
})

function RouteComponent() {
  return <div>Hello "/_private-routes/live-classes/"!</div>
}
