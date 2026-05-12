import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/_auth-layout')({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: '/',
      })
    }
  },
  staticData: {
    breadcrumb: undefined,
  },
})
