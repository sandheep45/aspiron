import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-routes/quizzes/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Tests & Quizzes',
  },
})

function RouteComponent() {
  return <div>Hello "/_private-routes/quizzes/"!</div>
}
