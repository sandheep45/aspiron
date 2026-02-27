import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/auth/_auth-layout/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [csrfToken, setCsrfToken] = useState<string>('')

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
  }, [])
  return (
    <div>
      <form action='/api/auth/callback/credentials' method='POST'>
        <input type='hidden' name='csrfToken' value={csrfToken} />
        <input
          type='hidden'
          name='email'
          value='barbara_turner.1@admin.aspiron'
        />
        <input type='hidden' name='password' value='admin123' />
        <button type='submit' className=''>
          Login
        </button>
      </form>
    </div>
  )
}
