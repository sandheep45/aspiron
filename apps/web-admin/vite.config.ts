import { fileURLToPath, URL } from 'node:url'
import { PUBLIC_ENV_PREFIX } from '@aspiron/config/global-constant'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig(({ mode }) => ({
  envDir: '../../',
  envPrefix: [PUBLIC_ENV_PREFIX],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    allowedHosts: ['local.aspiron.test'],
    ...(mode === 'development' && {
      https: {
        key: '../../local.aspiron.test-key.pem',
        cert: '../../local.aspiron.test.pem',
      },
    }),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
  ssr: {
    noExternal: ['@aspiron/tanstack-client'],
  },
  plugins: [
    devtools(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
}))

export default config
