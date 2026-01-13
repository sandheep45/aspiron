/**
 * User management hooks using TanStack Query
 */

import {
  type UpdateUserRequest,
  type User,
  usersService,
} from '@aspiron/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/types/query-keys'

// Types
export interface UseUsersReturn {
  users: User[]
  total: number
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export interface UseUserReturn {
  user: User | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to get all users with pagination
 */
export const useUsers = (page = 1, limit = 10): UseUsersReturn => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.users.list(page, limit),
    queryFn: () => usersService.getUsers(page, limit),
  })

  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Hook to get a single user by ID
 */
export const useUser = (id: string): UseUserReturn => {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersService.getUser(id),
    enabled: !!id,
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
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersService.createUser,
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
  })
}

/**
 * Hook to update a user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific user and users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
  })
}

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
  })
}
