import { type AuthResponse, apiClient } from '@aspiron/api-client'
import { isAxiosError } from '@aspiron/api-client/axios-utils'
import Credentials from '@auth/core/providers/credentials'
import { createServerFn } from '@tanstack/react-start'
import {
  deleteCookie,
  getCookies,
  getRequest,
  setCookie,
} from '@tanstack/react-start/server'
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
        try {
          const data = await apiClient.post('/auth/login', credentials)
          const loggedInUserData = data.data
          return {
            ...loggedInUserData,
          }
        } catch (error) {
          if (isAxiosError(error)) {
            console.log('error', error.response)
          }
          return null
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

    const hasJwt = 'jwt' in cookies
    const hasRefresh = 'jwt_refresh' in cookies

    // If session exists but cookies are missing → set them
    if (session && (!hasJwt || !hasRefresh)) {
      const { access_token, refresh_token } = session.session

      setCookie('jwt', access_token)
      setCookie('jwt_refresh', refresh_token)
    }

    // If cookies exist but session is missing → clear them
    if (!session && (hasJwt || hasRefresh)) {
      deleteCookie('jwt')
      deleteCookie('jwt_refresh')
    }

    return session
  },
)
