import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout',
)({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Content',
  },
})

function RouteComponent() {
  return <Outlet />
}
