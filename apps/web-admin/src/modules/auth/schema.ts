import z from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
  csrfToken: z.string(),
})
export type LoginSchema = typeof loginSchema
export type OutputLoginSchema = z.output<LoginSchema>

export const logoutSchema = loginSchema.pick({
  csrfToken: true,
})
export type LogoutSchema = typeof logoutSchema
export type OutputLogoutSchema = z.output<LogoutSchema>
