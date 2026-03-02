import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-routes/content/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Content',
  },
})

function RouteComponent() {
  return <div>Hello "/_private-routes/content/"!</div>
}
