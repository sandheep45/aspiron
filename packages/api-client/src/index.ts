// Export all public APIs here

// Client utilities
export * from './client/auth'
export * from './client/axios-instance'
// Configuration
export * from './config/env'
export * from './generated-types'
export * from './services/assignments.service'
// Services
export { authService, type User } from './services/auth.service'
export * from './services/courses.service'
export * from './services/users.service'
// Utilities
export * from './utils/error-handler'
