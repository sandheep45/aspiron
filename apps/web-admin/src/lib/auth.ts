import { type AuthResponse, apiClient } from '@aspiron/api-client'
import { isAxiosError } from '@aspiron/api-client/axios-utils'
import Credentials from '@auth/core/providers/credentials'
import { createServerFn } from '@tanstack/react-start'
import { getCookies } from '@tanstack/react-start/server'
import {
  CredentialsSignin,
  StartAuthJS,
  type StartAuthJSConfig,
} from 'start-authjs'

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
          if (credentials.data) {
            const refreshTokenData = JSON.parse(credentials.data as string)
            return { ...refreshTokenData }
          }

          const data = await apiClient.post('/auth/login', credentials)
          return { ...data.data }
        } catch (error) {
          if (isAxiosError(error)) {
            throw new CredentialsSignin(JSON.stringify(error.response?.data))
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

export const { GET, POST, signIn, signOut } = StartAuthJS(authConfig)

declare module 'start-authjs' {
  interface AuthSession {
    session: AuthResponse
  }
}

export const fetchSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const cookies = getCookies()

    const jwtRefreshCookie = cookies.jwt_refresh

    if (jwtRefreshCookie)
      return {
        isAuthenticated: true,
      }

    return {
      isAuthenticated: false,
    }
  },
)
