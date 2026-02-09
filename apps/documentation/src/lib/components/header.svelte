<script lang="ts">
import {
  Brain,
  Github,
  HelpCircle,
  Menu,
  Moon,
  Search,
  Sun,
} from '@lucide/svelte'
import { Modal } from '@skeletonlabs/skeleton-svelte'
import { type Hit, MeiliSearch } from 'meilisearch'
import { goto } from '$app/navigation'
import { page } from '$app/stores'

interface Props {
  sidebarOpen?: boolean
  onOpenSidebar?: () => void
}

const { sidebarOpen = false, onOpenSidebar }: Props = $props()

let searchOpen = $state(false)
let searchQuery = $state('')
let isDark = $state(false)
let searchResults = $state<Hit[]>([])
let isSearching = $state(false)

const client = new MeiliSearch({
  host: import.meta.env.VITE_MEILI_HOST || 'http://localhost:7700',
  apiKey: import.meta.env.VITE_MEILI_API_KEY || 'aSampleMasterKey',
})

async function performSearch(query: string) {
  if (!query.trim()) {
    searchResults = []
    return
  }

  isSearching = true
  try {
    const index = client.index('docs')
    const response = await index.search(query, {
      limit: 10,
      attributesToHighlight: ['title', 'description'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    })
    searchResults = response.hits
    console.log('Search results:', searchResults) // Debug
  } catch (error) {
    console.error('Search error:', error)
    searchResults = []
  } finally {
    isSearching = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
function handleQueryChange(query: string) {
  searchQuery = query
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => performSearch(query), 200)
}

function handleResultClick(slug: string) {
  searchOpen = false
  searchQuery = ''
  searchResults = []
  goto(`/docs/${slug}`)
}

function handleThemeChange() {
  isDark = !isDark
  document.documentElement.classList.toggle('dark', isDark)
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

function handleModalOpenChange(details: { open: boolean }) {
  searchOpen = details.open
  if (!details.open) {
    searchQuery = ''
    searchResults = []
  }
}

function handleKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    searchOpen = true
  }
}

$effect(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark = savedTheme ? savedTheme === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark)
})

$effect(() => {
  document.addEventListener('keydown', handleKeydown)
  return () => document.removeEventListener('keydown', handleKeydown)
})

const navLinks = [
  { href: '/docs/intro', label: 'Introduction' },
  { href: '/docs/mvp-scope', label: 'MVP Scope' },
  { href: '/docs/student-journey', label: 'Student Journey' },
  { href: '/docs/design-philosophy', label: 'Philosophy' },
  { href: '/docs/roadmap', label: 'Roadmap' },
]
</script>

<header
  class="sticky top-0 z-40 w-full border-b border-surface-200-800 bg-white dark:bg-surface-900 backdrop-blur"
>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-3 group">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-surface-900 dark:text-white shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-105"
          >
            <Brain class="h-6 w-6" />
          </div>
          <div class="hidden sm:block">
            <span class="text-lg font-bold text-surface-900 dark:text-white"
              >Aspiron</span
            >
            <span class="block text-xs text-surface-500-400">Documentation</span
            >
          </div>
        </a>
      </div>

      <nav class="hidden lg:flex items-center gap-1">
        {#each navLinks as link}
          <a
            href={link.href}
            class="relative px-4 py-2 text-sm font-medium text-surface-600-400 transition-colors hover:text-surface-900-50 rounded-lg hover:bg-surface-100-800/50"
            class:text-primary-600={$page.url.pathname === link.href}
            class:dark:text-primary-400={$page.url.pathname === link.href}
          >
            {link.label}
            {#if $page.url.pathname === link.href}
              <span
                class="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary-600 dark:bg-primary-400"
              ></span>
            {/if}
          </a>
        {/each}
      </nav>

      <button
        onclick={onOpenSidebar}
        class="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-surface-200-700 text-surface-600-400 transition-all hover:bg-surface-300-600 hover:text-surface-900-50"
        aria-label="Open menu"
      >
        <Menu class="h-5 w-5" />
      </button>

      <div class="flex items-center gap-2">
        <button
          onclick={() => (searchOpen = true)}
          class="flex h-10 items-center gap-2 rounded-lg border border-surface-200-700 bg-surface-50-900 px-4 text-sm text-surface-500-400 transition-all hover:border-primary-300 hover:bg-white dark:hover:bg-surface-800"
          aria-label="Search documentation"
        >
          <Search class="h-4 w-4" />
          <span class="hidden sm:inline">Search...</span>
          <kbd
            class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-surface-200-700 bg-surface-100-800 px-1.5 text-xs font-mono text-surface-500-400"
          >
            <span class="text-xs">⌘</span>K
          </kbd>
        </button>

        <div class="h-6 w-px bg-surface-200-700"></div>

        <button
          onclick={handleThemeChange}
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-200-700 text-surface-600-400 transition-all hover:bg-surface-300-600 hover:text-surface-900-50"
          aria-label="Toggle theme"
        >
          {#if isDark}
            <Sun class="h-5 w-5" />
          {:else}
            <Moon class="h-5 w-5" />
          {/if}
        </button>

        <a
          href="/docs/intro"
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-200-700 text-surface-600-400 transition-all hover:bg-surface-300-600 hover:text-surface-900-50"
          aria-label="Help"
        >
          <HelpCircle class="h-5 w-5" />
        </a>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-200-700 text-surface-600-400 transition-all hover:bg-surface-300-600 hover:text-surface-900-50"
          aria-label="GitHub"
        >
          <Github class="h-5 w-5" />
        </a>
      </div>
    </div>
  </div>
</header>

<Modal
  open={searchOpen}
  onOpenChange={handleModalOpenChange}
  backdropBackground="bg-black/50"
  positionerPadding="p-4"
  contentBase="bg-surface-100-900 rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-auto"
>
  {#snippet content()}
    <style>
      mark {
        background-color: rgb(59 130 246 / 0.3);
        color: inherit;
        padding: 0 2px;
        border-radius: 2px;
      }
    </style>
    <div class="relative">
      <Search
        class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400-500 z-10"
      />
      <input
        type="text"
        placeholder="Search documentation..."
        bind:value={searchQuery}
        oninput={(e) => handleQueryChange((e.target as HTMLInputElement).value)}
        class="w-full rounded-lg border border-surface-200-700 bg-surface-50-900 py-3 pl-10 pr-4 text-surface-900-50 placeholder-surface-400-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
      {#if isSearching}
        <div class="mt-4 text-center text-surface-500-400">
          <div class="inline-flex items-center gap-2">
            <div
              class="w-4 h-4 border-2 border-surface-400 border-t-primary-500 rounded-full animate-spin"
            ></div>
            Searching...
          </div>
        </div>
      {:else if searchResults.length > 0}
        <div class="mt-4 max-h-80 overflow-y-auto space-y-1">
          {#each searchResults as result}
            <button
              onclick={() => handleResultClick(result.slug)}
              class="w-full text-left p-3 rounded-lg hover:bg-surface-200-700 transition-colors border border-transparent hover:border-surface-300-600"
            >
              <div class="font-medium text-surface-900-50">
                {#if result._formatted?.title}
                  {@html result._formatted.title}
                {:else}
                  {result.title}
                {/if}
              </div>
              {#if result._formatted?.description || result.description}
                <div class="text-sm text-surface-500-400 mt-1">
                  {#if result._formatted?.description}
                    {@html result._formatted.description}
                  {:else}
                    {result.description}
                  {/if}
                </div>
              {/if}
              {#if result.section}
                <div class="text-xs text-surface-400-500 mt-1">
                  {result.section}
                </div>
              {/if}
            </button>
          {/each}
        </div>
      {:else if searchQuery && !isSearching}
        <div class="mt-4 text-center text-surface-500-400">
          No results found for "{searchQuery}"
        </div>
      {/if}
    </div>
  {/snippet}
</Modal>
