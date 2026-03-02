import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-routes/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: undefined,
  },
})

function RouteComponent() {
  return <div>Hello "/_private-routes/"! vnvkub</div>
}
