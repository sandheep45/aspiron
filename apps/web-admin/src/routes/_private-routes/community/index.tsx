import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-routes/community/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Community',
  },
})

function RouteComponent() {
  return <div>Hello "/_private-routes/community/"!</div>
}
