/**
 * Axios instance configuration with interceptors
 */

import { env } from '@aspiron/config'
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { defaultAuthStrategy } from '@/client/auth'
import type { AllowedClientType } from '@/generated-types'

export interface AxiosConfigOptions
  extends Omit<AxiosRequestConfig, 'headers'> {
  headers: AxiosRequestConfig['headers'] & {
    'X-client-type': AllowedClientType
  }
}

export interface ServiceOptions {
  axiosConfig?: AxiosConfigOptions
}

const defaultConfig: AxiosConfigOptions = {
  baseURL: env.PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-client-type': 'BROWSER',
  },
  withCredentials: true,
}

const createAxiosInstanceWithConfig = (
  config?: AxiosRequestConfig,
): AxiosInstance => {
  const mergedConfig = { ...defaultConfig, ...config }
  // Deep merge headers
  if (config?.headers) {
    mergedConfig.headers = { ...defaultConfig.headers, ...config.headers }
  }

  const instance = axios.create(mergedConfig)

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Apply authentication strategy
      defaultAuthStrategy.setAuthHeaders(config)
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      // Apply authentication strategy response handling
      defaultAuthStrategy.handleResponse(response)
      return response
    },
    (error) => {
      // Handle common error scenarios
      if (error.response?.status === 401) {
        // Unauthorized - could trigger logout or token refresh
        defaultAuthStrategy.clearAuth()
      }
      return Promise.reject(error)
    },
  )

  return instance
}

// Default axios instance
export const apiClient = createAxiosInstanceWithConfig()

// Factory function for creating custom instances
export const createApiClient = (config?: AxiosConfigOptions): AxiosInstance => {
  return createAxiosInstanceWithConfig(config)
}

// Export the instance for consumers who want to customize it
export { axios }
