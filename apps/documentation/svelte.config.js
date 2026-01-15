import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.svelte.md', '.md', '.svx'],
      highlight: { theme: 'github-dark' },
    }),
  ],

  kit: {
    adapter: adapter(),
    alias: {
      $lib: './src/lib',
      $components: './src/lib/components',
      $utils: './src/lib/utils',
      $docs: './src/lib/docs',
      $assets: './src/lib/assets',
    },
  },

  extensions: ['.svelte', '.md', '.svx'],
}

export default config
