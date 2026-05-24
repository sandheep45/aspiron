import type { AxiosConfigOptions } from '@aspiron/api-client'
import { useAxiosConfig } from '@/providers/QueryProvider'

export const useMergedAxiosConfig = (options?: {
  axiosConfig?: AxiosConfigOptions
}): AxiosConfigOptions | undefined => {
  const providerAxiosConfig = useAxiosConfig()
  return options?.axiosConfig ?? providerAxiosConfig ?? undefined
}
