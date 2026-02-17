/**
 * Authentication hooks using TanStack Query
 */

import {
  type AxiosConfigOptions,
  authService,
  type LoginRequest,
  type LoginResponse,
} from '@aspiron/api-client'
import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { useAxiosConfig } from '@/providers/QueryProvider'

export interface UseLoginOptions
  extends Omit<
    UseMutationOptions<LoginResponse, Error, LoginRequest, unknown>,
    'mutationFn'
  > {
  axiosConfig?: AxiosConfigOptions
}

/**
 * Hook for user login
 */
export const useLogin = (options?: UseLoginOptions) => {
  const providerAxiosConfig = useAxiosConfig()

  return useMutation<LoginResponse, Error, LoginRequest, unknown>({
    ...options,
    mutationFn: (data: LoginRequest) => {
      const config = options?.axiosConfig || providerAxiosConfig || undefined
      return authService.login(data, { axiosConfig: config })
    },
  })
}
