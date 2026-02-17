/**
 * QueryProvider component with default TanStack Query configuration
 */

import type { AxiosConfigOptions } from '@aspiron/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

// Context for axios config
const AxiosConfigContext = createContext<AxiosConfigOptions | null>(null)

export const useAxiosConfig = (): AxiosConfigOptions | null => {
  return useContext(AxiosConfigContext)
}

// Default query client configuration
const createDefaultQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: (failureCount: number, error: unknown) => {
          // Don't retry on 4xx errors
          const axiosError = error as { status?: number } | undefined
          if (
            axiosError?.status &&
            axiosError.status >= 400 &&
            axiosError.status < 500
          ) {
            return false
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
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
