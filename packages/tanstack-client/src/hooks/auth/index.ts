/**
 * Authentication hooks using TanStack Query
 */

import { authService, type LoginRequest, type User } from '@aspiron/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/types/query-keys'

// Types
export interface UseAuthReturn {
  user: User | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export interface UseLoginReturn {
  login: (credentials: LoginRequest) => Promise<unknown>
  isPending: boolean
  isError: boolean
  error: Error | null
}

export interface UseLogoutReturn {
  logout: () => Promise<unknown>
  isPending: boolean
}

/**
 * Hook to get current authenticated user
 */
export const useAuth = (): UseAuthReturn => {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    user,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Hook for user login
 */
export const useLogin = (): UseLoginReturn => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (_data) => {
      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() })
      // Could also prefetch user data here
    },
  })

  return {
    login: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error as Error | null,
  }
}

/**
 * Hook for user logout
 */
export const useLogout = (): UseLogoutReturn => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear()
    },
  })

  return {
    logout: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}
