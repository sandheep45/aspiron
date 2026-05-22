import type {
  AuthPermissionResponse,
  AuthResponse,
  AuthRoleResponse,
  AuthUserResponse,
  MeResponse,
  PermissionResponse,
  ProgressResponse,
  RoleResponse,
  UserProfileDataResponse,
  UserProfileResponse,
  UserResponse,
  UserTypeEnums,
} from '@aspiron/api-client'

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}`

export const buildUserResponse = (
  overrides?: Partial<UserResponse>,
): UserResponse => ({
  id: nextId('user'),
  email: 'test@example.com',
  is_active: true,
  created_at: new Date('2025-01-01T00:00:00Z'),
  updated_at: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
})

export const buildUserResponseList = (
  count: number,
  overrides?: Partial<UserResponse>,
): UserResponse[] =>
  Array.from({ length: count }, (_, i) =>
    buildUserResponse({
      id: `user-${i + 1}`,
      email: `user${i + 1}@example.com`,
      ...overrides,
    }),
  )

export const buildAuthUserResponse = (
  overrides?: Partial<AuthUserResponse>,
): AuthUserResponse => ({
  id: nextId('user'),
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  avatar_url: null,
  is_active: true,
  created_at: new Date('2025-01-01T00:00:00Z'),
  updated_at: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
})

export const buildRoleResponse = (
  overrides?: Partial<RoleResponse>,
): RoleResponse => ({
  id: nextId('role'),
  name: 'STUDENT' as UserTypeEnums,
  display_name: 'Student',
  description: 'Student role',
  is_system_role: true,
  created_at: new Date('2025-01-01T00:00:00Z'),
  updated_at: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
})

export const buildPermissionResponse = (
  overrides?: Partial<PermissionResponse>,
): PermissionResponse => ({
  id: nextId('permission'),
  name: 'read_content',
  resource_type: 'CONTENT',
  action: 'READ',
  description: 'Read content',
  created_at: new Date('2025-01-01T00:00:00Z'),
  updated_at: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
})

export const buildAuthRoleResponse = (
  overrides?: Partial<AuthRoleResponse>,
): AuthRoleResponse => ({
  id: nextId('role'),
  name: 'STUDENT' as UserTypeEnums,
  display_name: 'Student',
  description: 'Student role',
  is_system_role: true,
  ...overrides,
})

export const buildAuthPermissionResponse = (
  overrides?: Partial<AuthPermissionResponse>,
): AuthPermissionResponse => ({
  id: nextId('permission'),
  name: 'read_content',
  resource_type: 'CONTENT',
  action: 'READ',
  description: 'Read content',
  ...overrides,
})

export const buildAuthResponse = (
  overrides?: Partial<AuthResponse>,
): AuthResponse => ({
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'Bearer',
  expires_in: BigInt(3600),
  user: buildAuthUserResponse(),
  roles: [buildAuthRoleResponse()],
  permissions: [buildAuthPermissionResponse()],
  ...overrides,
})

export const buildMeResponse = (
  overrides?: Partial<MeResponse>,
): MeResponse => ({
  user: buildUserResponse(),
  roles: [buildRoleResponse()],
  permissions: [buildPermissionResponse()],
  ...overrides,
})

export const buildUserProfileDataResponse = (
  overrides?: Partial<UserProfileDataResponse>,
): UserProfileDataResponse => ({
  first_name: 'Test',
  last_name: 'User',
  avatar_url: null,
  ...overrides,
})

export const buildUserProfileResponse = (
  overrides?: Partial<UserProfileResponse>,
): UserProfileResponse => ({
  user: buildUserResponse(),
  profile: buildUserProfileDataResponse(),
  roles: [buildRoleResponse()],
  permissions: [buildPermissionResponse()],
  resource_permissions: [],
  ...overrides,
})

export const buildProgressResponse = (
  overrides?: Partial<ProgressResponse>,
): ProgressResponse => ({
  id: nextId('progress'),
  user_id: nextId('user'),
  topic_id: nextId('topic'),
  progress_percent: 50,
  ...overrides,
})
