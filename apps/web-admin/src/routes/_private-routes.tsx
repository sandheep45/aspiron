import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-routes')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: '/auth',
      })
    }
  },
})

function RouteComponent() {
  return <div>Hello "/_private-routes"!</div>
}
