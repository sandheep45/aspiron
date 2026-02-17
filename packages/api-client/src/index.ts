// Export all public APIs here

// Client utilities
export * from './client/auth'
export * from './client/axios-instance'
// Configuration
export * from './generated-types'
// Services
export {
  authService,
  type LoginRequest,
  type LoginResponse,
  type User,
} from './services/auth.service'
// Utilities
export * from './utils/error-handler'
