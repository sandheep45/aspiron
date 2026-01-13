/**
 * User management service methods
 */

import { apiClient } from '@/client/axios-instance'
import type { User } from '@/services/auth.service'

// Extended user types
export interface CreateUserRequest {
  email: string
  name: string
  password: string
  role: 'student' | 'teacher' | 'admin'
}

export interface UpdateUserRequest {
  email?: string
  name?: string
  role?: 'student' | 'teacher' | 'admin'
}

export interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

// User service methods
export const usersService = {
  /**
   * Get all users with pagination
   */
  async getUsers(page = 1, limit = 10): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>('/users', {
      params: { page, limit },
    })
    return response.data
  },

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`)
    return response.data
  },

  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>('/users', userData)
    return response.data
  },

  /**
   * Update user
   */
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, userData)
    return response.data
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  },
}
