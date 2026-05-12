/**
 * Authentication hooks using TanStack Query (DRY + Correct Patterns)
 */

import {
  type ApiResponse,
  type AuthResponse,
  type AxiosConfigOptions,
  authService,
  type LoginRequest,
} from '@aspiron/api-client'
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { useAxiosConfig } from '@/providers/QueryProvider'

/**
 * -------------------------
 * Shared Types
 * -------------------------
 */

type AuthMutationOptions<TData, TVariables> = UseMutationOptions<
  TData,
  Error,
  TVariables
> & {
  axiosConfig?: AxiosConfigOptions
}

type AuthQueryOptions<TData> = UseQueryOptions<TData, Error> & {
  axiosConfig?: AxiosConfigOptions
}

/**
 * -------------------------
 * Shared Helpers
 * -------------------------
 */

/**
 * Mutation helper
 */
function useAuthMutation<TData, TVariables>(
  mutationFn: (
    variables: TVariables,
    options?: { axiosConfig?: AxiosConfigOptions },
  ) => Promise<TData>,
  options?: AuthMutationOptions<TData, TVariables>,
) {
  const providerAxiosConfig = useAxiosConfig()

  return useMutation<TData, Error, TVariables>({
    ...options,
    mutationFn: (variables: TVariables) => {
      const axiosConfig =
        options?.axiosConfig ?? providerAxiosConfig ?? undefined

      return mutationFn(variables, { axiosConfig })
    },
  })
}

/**
 * Query helper
 */
function useAuthQuery<TData>(
  queryKey: unknown[],
  queryFn: (options?: { axiosConfig?: AxiosConfigOptions }) => Promise<TData>,
  options?: AuthQueryOptions<TData>,
) {
  const providerAxiosConfig = useAxiosConfig()

  return useQuery<TData, Error>({
    queryKey,
    ...options,
    queryFn: () => {
      const axiosConfig =
        options?.axiosConfig ?? providerAxiosConfig ?? undefined

      return queryFn({ axiosConfig })
    },
  })
}

/**
 * -------------------------
 * Auth Mutations
 * -------------------------
 */

/**
 * Login
 */
export const useLoginMutation = (
  options?: AuthMutationOptions<ApiResponse<null>, LoginRequest>,
) => useAuthMutation(authService.login, options)

/**
 * Refresh Token
 */
const wrapNoVars =
  <TData>(
    fn: (options?: { axiosConfig?: AxiosConfigOptions }) => Promise<TData>,
  ) =>
  (_: unknown, options?: { axiosConfig?: AxiosConfigOptions }) =>
    fn(options)

export const useRefreshTokenMutation = (
  options?: AuthMutationOptions<ApiResponse<null>, void>,
) => useAuthMutation(wrapNoVars(authService.refreshAccessToken), options)

/**
 * -------------------------
 * Auth Queries
 * -------------------------
 */

/**
 * Get My Profile (Query ✅)
 */
export const useMyProfileQuery = (
  options?: AuthQueryOptions<ApiResponse<AuthResponse>>,
) =>
  useAuthQuery(
    ['auth', 'me'],
    (config) => authService.getMyProfile({ axiosConfig: config?.axiosConfig }),
    options,
  )
