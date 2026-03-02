import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-routes/analytics/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Analytics',
  },
})

function RouteComponent() {
  return <div>Hello "/_private-routes/analytics/"!</div>
}
