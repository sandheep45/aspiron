import {
  type AxiosConfigOptions,
  type LiveClassResponse,
  liveClassService,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseUpcomingClassesQueryOptions
  extends Omit<
    UseQueryOptions<LiveClassResponse[], Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useUpcomingClassesQuery = (
  options?: UseUpcomingClassesQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.liveClass.upcoming()],
    queryFn: () => {
      return liveClassService.getUpcomingClasses({
        options: { axiosConfig },
        args: {},
      })
    },
  })
}
