import type {
  AuthPermissionResponse,
  AuthRoleResponse,
  AuthUserResponse,
} from '@aspiron/api-client'
import z from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
})
export type LoginSchema = typeof loginSchema
export type OutputLoginSchema = z.output<LoginSchema>

export const logoutSchema = z.object({
  csrfToken: z.string(),
})
export type LogoutSchema = typeof logoutSchema
export type OutputLogoutSchema = z.output<LogoutSchema>

export const tokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  expires_in: z.coerce.number(),
  user: z.custom<AuthUserResponse>(),
  roles: z.custom<AuthRoleResponse[]>(),
  permissions: z.custom<AuthPermissionResponse[]>(),
})
export type TokenSchema = typeof tokenSchema
export type OutputTokenSchema = z.output<TokenSchema>
