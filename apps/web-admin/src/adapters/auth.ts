import type {
  AuthPermissionResponse,
  AuthResponse,
  AuthRoleResponse,
  AuthUserResponse,
  LoginRequest,
} from '@aspiron/api-client'
import z from 'zod'

export const authUserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  first_name: z.nullable(z.string()),
  last_name: z.nullable(z.string()),
  avatar_url: z.nullable(z.string()),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
}) satisfies z.ZodType<AuthUserResponse>

export const authRoleResponseSchema = z.object({
  name: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  display_name: z.string(),
  description: z.nullable(z.string()),
  is_system_role: z.boolean(),
}) satisfies z.ZodType<AuthRoleResponse>

export const authPermissionResponseSchema = z.object({
  name: z.string(),
  resource_type: z.enum([
    'USER',
    'CONTENT',
    'ASSESSMENT',
    'COMMUNITY',
    'SYSTEM',
    'SUBJECT',
    'CHAPTER',
    'TOPIC',
    'VIDEO',
    'QUIZ',
    'QUESTION',
    'THREAD',
    'POST',
    'NOTE',
  ]),
  action: z.enum([
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'MANAGE',
    'PUBLISH',
    'MODERATE',
    'GRADE',
    'TAKE',
    'VIEW_RESULTS',
    'VIEW_ANY_RESULTS',
    'ASSIGN_ROLES',
    'VIEW_ANALYTICS',
    'MANAGE_SETTINGS',
    'AUDIT',
  ]),
  description: z.nullable(z.string()),
}) satisfies z.ZodType<AuthPermissionResponse>

export const authResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  expires_in: z.bigint(),
  user: authUserResponseSchema,
  roles: z.array(authRoleResponseSchema),
  permissions: z.array(authPermissionResponseSchema),
}) satisfies z.ZodType<AuthResponse>

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string(),
}) satisfies z.ZodType<LoginRequest>
