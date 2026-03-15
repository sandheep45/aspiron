import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-routes/')({
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard',
    })
  },
  staticData: {
    breadcrumb: undefined,
  },
})
