import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  deleteCookie,
  getRequest,
  getResponse,
} from '@tanstack/react-start/server'
import { signOut } from '@/lib/auth'

export const signOutServerFunction = createServerFn({ method: 'POST' }).handler(
  async () => {
    const request = getRequest()
    const response = getResponse()

    const headers = request.headers
    headers.set('Content-Type', 'application/x-www-form-urlencoded')

    const newRequest = new Request(request.url, {
      method: 'POST',
      headers,
      body: new URLSearchParams(),
    })

    await signOut({ request: newRequest, response })

    deleteCookie('jwt')
    deleteCookie('jwt_refresh')
    redirect({
      to: '/auth/login',
    })
  },
)
