import { PUBLIC_ENV_PREFIX } from '@aspiron/config/global-constant'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  envDir: '../../',
  envPrefix: [PUBLIC_ENV_PREFIX],
  plugins: [
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ApiClient',
      fileName: 'api-client',
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
})
