import type { ServiceOptions } from '@/client/axios-instance'

export type ServiceMethodArguments<T extends object | undefined | undefined> = {
  args?: T
  options?: ServiceOptions
}
export type * from './overright-generated-types'
