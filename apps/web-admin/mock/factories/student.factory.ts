import type {
  AuthResponse,
  MeResponse,
  UserProfileResponse,
  UserResponse,
} from '@aspiron/api-client'
import {
  buildAuthResponse,
  buildMeResponse,
  buildUserProfileResponse,
  buildUserResponse,
} from '@aspiron/test-utils/factories'

export function createUserResponse(
  overrides?: Partial<UserResponse>,
): UserResponse {
  return buildUserResponse(overrides)
}

export function createAuthResponse(
  overrides?: Partial<AuthResponse>,
): AuthResponse {
  return buildAuthResponse(overrides)
}

export function createMeResponse(overrides?: Partial<MeResponse>): MeResponse {
  return buildMeResponse(overrides)
}

export function createUserProfileResponse(
  overrides?: Partial<UserProfileResponse>,
): UserProfileResponse {
  return buildUserProfileResponse(overrides)
}
