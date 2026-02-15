// Export all public APIs here

import { useQuery } from '@tanstack/react-query'

export * from '@/hooks/assignments/index'
// Hooks
export * from '@/hooks/auth/index'
export * from '@/hooks/courses/index'
export * from '@/hooks/users/index'
// Provider
export * from '@/providers/QueryProvider'
// Types and utilities
export * from '@/types/query-keys'
export * from '@/utils/error-boundary'

export const useTestQuery = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: () =>
      fetch('https://jsonplaceholder.typicode.com/todos/1').then((res) =>
        res.json(),
      ),
  })
}
