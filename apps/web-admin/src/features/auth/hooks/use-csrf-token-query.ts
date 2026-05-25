import { apiClient } from '@aspiron/api-client'
import { useQuery } from '@tanstack/react-query'

export const useCsrfTokenQuery = () => {
  return useQuery({
    placeholderData: '',
    queryKey: ['get-csrf-token'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ csrfToken: string }>(
        '/api/auth/csrf',
      )
      return data.csrfToken
    },
  })
}
