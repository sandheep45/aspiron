/**
 * Authentication strategies and utilities
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface AuthStrategy {
  setAuthHeaders(config: AxiosRequestConfig): void
  handleResponse(response: AxiosResponse): void
  clearAuth(): void
}

export class CookieAuthStrategy implements AuthStrategy {
  setAuthHeaders(_config: AxiosRequestConfig): void {
    // Cookies are handled automatically by browser
    // No additional headers needed for cookie-based auth
  }

  handleResponse(_response: AxiosResponse): void {
    // Handle any auth-related response processing
    // For cookies, this is typically handled automatically
  }

  clearAuth(): void {
    // Clear any client-side auth state if needed
    // For cookies, server typically handles this
  }
}

// Extensible JWT strategy for future use
export class JwtAuthStrategy implements AuthStrategy {
  private token: string | null = null

  constructor(token?: string) {
    this.token = token || null
  }

  setAuthHeaders(config: AxiosRequestConfig): void {
    if (this.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${this.token}`
    }
  }

  handleResponse(response: AxiosResponse): void {
    // Extract and store token from response if present
    const authHeader = response.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      this.token = authHeader.substring(7)
    }
  }

  clearAuth(): void {
    this.token = null
  }

  setToken(token: string): void {
    this.token = token
  }

  getToken(): string | null {
    return this.token
  }
}

// Default auth strategy (can be changed by consumers)
export const defaultAuthStrategy = new CookieAuthStrategy()
