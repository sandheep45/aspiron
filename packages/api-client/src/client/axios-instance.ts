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

let isRefreshing = false

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
    async (error) => {
      const originalRequest = error.config
      const status = error.response?.status

      // Handle 401 - token refresh
      if (status === 401 && originalRequest) {
        // Skip if already retried
        if (originalRequest._retry) {
          return Promise.reject(error)
        }

        // Handle token refresh
        if (!isRefreshing) {
          originalRequest._retry = true
          isRefreshing = true

          try {
            // Call refresh token endpoint (cookies auto-attached by browser)
            await instance.get('/auth/refresh-token')

            // All handlers completed, retry the original request
            return instance(originalRequest)
          } catch (refreshError) {
            // Refresh failed
            defaultAuthStrategy.clearAuth()
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        }

        // If already refreshing, reject - caller will retry later
        return Promise.reject(error)
      }

      // Non-401 errors - just reject
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
