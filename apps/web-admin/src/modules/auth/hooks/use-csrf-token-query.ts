import { useQuery } from '@tanstack/react-query'

export const useCsrfTokenQuery = () => {
  return useQuery({
    placeholderData: '',
    queryKey: ['get-csrf-token'],
    queryFn: async () => {
      const csrfToken = await fetch('/api/auth/csrf')
        .then((res) => res.json())
        .then((data) => data.csrfToken)

      return csrfToken
    },
  })
}
