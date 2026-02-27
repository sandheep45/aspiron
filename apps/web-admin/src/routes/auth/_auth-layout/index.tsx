import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/_auth-layout/')({
  beforeLoad: () => {
    throw redirect({
      to: '/auth/login',
    })
  },
})
