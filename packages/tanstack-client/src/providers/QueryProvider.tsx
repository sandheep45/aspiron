/**
 * QueryProvider component with default TanStack Query configuration
 */

import type { AxiosConfigOptions } from '@aspiron/api-client'
import {
  QueryClient,
  type QueryClientConfig,
  QueryClientProvider,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createContext, use } from 'react'

// Context for axios config
const AxiosConfigContext = createContext<AxiosConfigOptions | null>(null)

export const useAxiosConfig = (): AxiosConfigOptions | null => {
  return use(AxiosConfigContext)
}

// Default query client configuration
const defaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount: number, error: unknown) => {
      const axiosError = error as { status?: number } | undefined
      if (
        axiosError?.status &&
        axiosError.status >= 400 &&
        axiosError.status < 500
      ) {
        return false
      }
      return failureCount < 3
    },
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
}

const createDefaultQueryClient = (config?: QueryClientConfig) => {
  const options = config?.defaultOptions ?? {}
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...defaultOptions.queries,
        ...options.queries,
      },
      mutations: {
        ...defaultOptions.mutations,
        ...options.mutations,
      },
    },
    queryCache: config?.queryCache,
    mutationCache: config?.mutationCache,
  })
}

interface QueryProviderProps {
  children: ReactNode
  client?: QueryClient
  axiosConfig?: AxiosConfigOptions
}

/**
 * QueryProvider wraps your app with TanStack Query client
 * Uses default configuration but allows consumers to pass custom client
 * and axios config options
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  client = createDefaultQueryClient(),
  axiosConfig,
}) => {
  return (
    <AxiosConfigContext.Provider value={axiosConfig || null}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </AxiosConfigContext.Provider>
  )
}

// Export the query client factory for consumers who want to customize
export { createDefaultQueryClient }
export type { QueryClientConfig }
