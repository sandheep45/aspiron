import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private-routes/content/"!</div>
}
