/**
 * Authentication service methods
 */

import {
  apiClient,
  createApiClient,
  type ServiceOptions,
} from '@/client/axios-instance'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  success: boolean
}

export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'admin'
}

export const authService = {
  async login(
    credentials: LoginRequest,
    options?: ServiceOptions,
  ): Promise<LoginResponse> {
    const client = options?.axiosConfig
      ? createApiClient(options.axiosConfig)
      : apiClient
    const response = await client.post<LoginResponse>(
      '/auth/login',
      credentials,
    )
    return response.data
  },
}
