import type { AxiosConfigOptions } from '@aspiron/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type RenderOptions, render } from '@testing-library/react'
import type { ReactNode } from 'react'

export function createMockQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

interface ProviderOptions {
  queryClient?: QueryClient
  axiosConfig?: AxiosConfigOptions
  isAuthenticated?: boolean
}

function TestProviders({
  children,
  options,
}: {
  children: ReactNode
  options: ProviderOptions
}) {
  const queryClient = options.queryClient ?? createMockQueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

function customRender(
  ui: ReactNode,
  options?: RenderOptions & ProviderOptions,
) {
  const { queryClient, axiosConfig, isAuthenticated, ...renderOptions } =
    options ?? {}

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders options={{ queryClient, axiosConfig, isAuthenticated }}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  })
}

export { customRender as render }
