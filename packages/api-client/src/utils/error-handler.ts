/**
 * Generic error handling utilities
 */

export interface ApiError {
  status: number
  message: string
  data?: unknown
  code?: string
}

export interface ErrorHandler {
  handle(error: ApiError): void
}

/**
 * Default error handler - can be extended by consumers
 */
export class DefaultErrorHandler implements ErrorHandler {
  handle(error: ApiError): void {
    console.error(`API Error [${error.status}]: ${error.message}`, error.data)

    // Default handling based on status code
    switch (error.status) {
      case 400:
        // Bad request - validation error
        this.handleValidationError(error)
        break
      case 401:
        // Unauthorized
        this.handleUnauthorized(error)
        break
      case 403:
        // Forbidden
        this.handleForbidden(error)
        break
      case 404:
        // Not found
        this.handleNotFound(error)
        break
      case 500:
        // Server error
        this.handleServerError(error)
        break
      default:
        this.handleUnknownError(error)
    }
  }

  protected handleValidationError(error: ApiError): void {
    // Default: just log the error
    console.warn('Validation error:', error.data)
  }

  protected handleUnauthorized(_error: ApiError): void {
    // Default: redirect to login or clear auth
    console.warn('Unauthorized access - please login')
    // Could trigger logout or redirect
  }

  protected handleForbidden(error: ApiError): void {
    console.warn('Access forbidden:', error.message)
  }

  protected handleNotFound(error: ApiError): void {
    console.warn('Resource not found:', error.message)
  }

  protected handleServerError(error: ApiError): void {
    console.error('Server error:', error.message)
  }

  protected handleUnknownError(error: ApiError): void {
    console.error('Unknown error:', error)
  }
}

/**
 * Convert axios error to ApiError format
 */
export const createApiError = (error: unknown): ApiError => {
  const axiosError = error as
    | {
        response?: { status: number; data?: { message?: string } }
        request?: unknown
        message?: string
        code?: string
      }
    | undefined

  if (axiosError?.response) {
    // Server responded with error status
    return {
      status: axiosError.response.status,
      message:
        axiosError.response.data?.message ||
        axiosError.message ||
        'Server error',
      data: axiosError.response.data,
      code: axiosError.code,
    }
  } else if (axiosError?.request) {
    // Request was made but no response received
    return {
      status: 0,
      message: 'Network error - no response received',
      data: axiosError.request,
      code: axiosError.code,
    }
  } else {
    // Something else happened
    return {
      status: 0,
      message: axiosError?.message || 'Unknown error occurred',
      code: axiosError?.code,
    }
  }
}

// Default error handler instance
export const defaultErrorHandler = new DefaultErrorHandler()
