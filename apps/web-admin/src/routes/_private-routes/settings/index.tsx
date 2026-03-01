import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-routes/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private-routes/settings/"!</div>
}
