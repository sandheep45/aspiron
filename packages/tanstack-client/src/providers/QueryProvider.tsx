/**
 * QueryProvider component with default TanStack Query configuration
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

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
}

/**
 * QueryProvider wraps your app with TanStack Query client
 * Uses default configuration but allows consumers to pass custom client
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  client = createDefaultQueryClient(),
}) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

// Export the query client factory for consumers who want to customize
export { createDefaultQueryClient }
