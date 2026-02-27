import { type AuthResponse, apiClient } from '@aspiron/api-client'
import Credentials from '@auth/core/providers/credentials'
import { createServerFn } from '@tanstack/react-start'
import { getCookies, getRequest, setCookie } from '@tanstack/react-start/server'
import { getSession, type StartAuthJSConfig } from 'start-authjs'

export const authConfig: StartAuthJSConfig = {
  basePath: '/api/auth',
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/',
  },
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const data = await apiClient.post('/auth/login', credentials)
        const loggedInUserData = data.data
        return {
          ...loggedInUserData,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      return {
        ...token,
        ...user,
      }
    },
    session: ({ session, token }) => {
      return {
        expires: session.expires,
        session: {
          ...session.user,
          ...token,
        },
      }
    },
  },
}

declare module 'start-authjs' {
  interface AuthSession {
    session: AuthResponse
  }
}

export const fetchSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest()
    const cookies = getCookies()
    const session = await getSession(request, authConfig)

    if (!('jwt' in cookies) && session) {
      const access_token = session.session.access_token
      const refresh_token = session.session.refresh_token

      setCookie('jwt', access_token)
      setCookie('jwt_refresh', refresh_token)
    }

    return session
  },
)
