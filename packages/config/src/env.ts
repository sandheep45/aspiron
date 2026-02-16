import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'
import { PUBLIC_ENV_PREFIX } from './global-constant'

export const env = createEnv({
  clientPrefix: PUBLIC_ENV_PREFIX,

  client: {
    PUBLIC_API_BASE_URL: z.string().url(),
  },

  server: {
    APP_HOST: z.string(),
    APP_PORT: z.coerce.number(),
    APP_ENV: z
      .enum(['development', 'staging', 'production'])
      .default('development'),

    DATABASE_URL: z.string().url(),
    DATABASE_POOL_SIZE: z.coerce.number(),

    JWT_SECRET: z.string().min(32),
    JWT_EXPIRY_HOURS: z.coerce.number(),
    JWT_COOKIE_NAME: z.string(),

    LOG_LEVEL: z.string(),
    LOG_FORMAT: z.enum(['json', 'pretty']),

    MEILI_HOST: z.string().url(),
    MEILI_MASTER_KEY: z.string().min(16),
    MEILI_INDEX_ENABLED: z.enum(['true', 'false']),

    SEED_PASSWORD_STRATEGY: z.enum([
      'fixed',
      'random',
      'pattern',
      'memorable',
      'custom',
    ]),
    ADMIN_PASSWORD: z.string(),
    TEACHER_PASSWORD: z.string(),
    STUDENT_PASSWORD: z.string(),
    SEED_PATTERN_PREFIX: z.string(),
    SEED_PATTERN_SUFFIX: z.enum(['year', 'role', 'number', 'mixed']),
  },

  runtimeEnv: {
    ...process.env,
    ...import.meta.env,
  },

  emptyStringAsUndefined: true,
})
