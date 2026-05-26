import {
  type AxiosConfigOptions,
  type GetUpcomingClassesArgs,
  type LiveClassesResponse,
  liveClassService,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseUpcomingClassesQueryOptions
  extends Omit<
    UseQueryOptions<LiveClassesResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args?: GetUpcomingClassesArgs
}

export const useUpcomingClassesQuery = (
  options?: UseUpcomingClassesQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [
      queryKeys.liveClass.list(
        options?.args?.page ?? 1,
        options?.args?.limit ?? 10,
      ),
    ],
    queryFn: () => {
      return liveClassService.getUpcomingClasses({
        options: { axiosConfig },
        args: options?.args,
      })
    },
  })
}
