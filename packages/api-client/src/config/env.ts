/**
 * Environment configuration for API client
 */

interface EnvConfig {
  API_BASE_URL: string
  API_TIMEOUT: number
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  // Handle both Vite and Node.js environments
  let envValue: string | undefined

  try {
    // Try Vite environment first
    const globalWithImport = globalThis as Record<string, unknown> & {
      import?: { meta?: { env?: Record<string, string> } }
    }
    envValue = globalWithImport.import?.meta?.env?.[key]
  } catch {
    // Fallback to Node.js environment
    envValue = process.env[key]
  }

  envValue = envValue || defaultValue

  if (!envValue && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return envValue || (defaultValue as string)
}

export const envConfig: EnvConfig = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api'),
  API_TIMEOUT: 10000, // 10 seconds
}
