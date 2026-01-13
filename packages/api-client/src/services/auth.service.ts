/**
 * Authentication service methods
 */

import { apiClient } from '@/client/axios-instance'

// Types
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

// Auth service methods
export const authService = {
  /**
   * Login user with credentials
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials,
    )
    return response.data
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  /**
   * Refresh authentication (for JWT strategy)
   */
  async refresh(): Promise<void> {
    await apiClient.post('/auth/refresh')
  },
}
