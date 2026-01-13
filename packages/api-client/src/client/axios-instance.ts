/**
 * Axios instance configuration with interceptors
 */

import axios, { type AxiosInstance } from 'axios'
import { defaultAuthStrategy } from '@/client/auth'
import { envConfig } from '@/config/env'

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: envConfig.API_BASE_URL,
    timeout: envConfig.API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for cookie-based auth
  })

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
export const apiClient = createAxiosInstance()

// Export the instance for consumers who want to customize it
export { axios }
