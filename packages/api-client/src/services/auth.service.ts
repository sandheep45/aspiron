/**
 * Authentication service methods (DRY + Axios-native)
 */

import type { AxiosRequestConfig } from 'axios'
import {
  apiClient,
  createApiClient,
  type ServiceOptions,
} from '@/client/axios-instance'
import type { ApiResponse, AuthResponse, LoginRequest } from '@/generated-types'

/**
 * Get axios client
 */
const getClient = (options?: ServiceOptions) =>
  options?.axiosConfig ? createApiClient(options.axiosConfig) : apiClient

/**
 * Generic request using axios.request()
 */
const request = async <T>(
  config: AxiosRequestConfig,
  options?: ServiceOptions,
): Promise<ApiResponse<T>> => {
  const client = getClient(options)
  const response = await client.request<ApiResponse<T>>(config)
  return response.data
}

export const authService = {
  login(credentials: LoginRequest, options?: ServiceOptions) {
    return request<null>(
      {
        method: 'POST',
        url: '/auth/login',
        data: credentials,
      },
      options,
    )
  },

  refreshAccessToken(options?: ServiceOptions) {
    return request<null>(
      {
        method: 'GET',
        url: '/auth/refresh-token',
      },
      options,
    )
  },

  getMyProfile(options?: ServiceOptions) {
    return request<AuthResponse>(
      {
        method: 'GET',
        url: '/auth/me',
      },
      options,
    )
  },
}
