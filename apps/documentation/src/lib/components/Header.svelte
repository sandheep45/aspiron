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
import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte'
import { goto } from '$app/navigation'
import { page } from '$app/stores'
import { docs } from '$lib/docs.ts'
import type { Doc } from '$lib/utils/types.ts'

interface Props {
  sidebarOpen?: boolean
  onOpenSidebar?: () => void
}

// biome-ignore lint/correctness/noUnusedVariables: used in template
const { sidebarOpen = false, onOpenSidebar }: Props = $props()

let searchOpen = $state(false)
let searchQuery = $state('')
let isDark = $state(false)

type DocItem = {
  label: string
  value: string
  description?: string
}

const docItems: DocItem[] = $derived(
  docs.map((doc: Doc) => ({
    label: doc.title,
    value: doc.slug,
    description: doc.description,
  })),
)

const filteredItems = $derived(
  searchQuery
    ? docItems.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [],
)

function handleThemeChange() {
  isDark = !isDark
  document.documentElement.classList.toggle('dark', isDark)
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

function handleSelection(details: { value: string[] }) {
  searchOpen = false
  searchQuery = ''
  if (details.value.length > 0) {
    goto(`/docs/${details.value[0]}`)
  }
}

function handleModalOpenChange(details: { open: boolean }) {
  searchOpen = details.open
  if (!details.open) {
    searchQuery = ''
  }
}

$effect(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark = savedTheme ? savedTheme === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark)
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
						<span class="text-lg font-bold text-surface-900 dark:text-white">Aspiron</span>
						<span class="block text-xs text-surface-500-400">Documentation</span>
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
	contentBase="bg-surface-100-900 rounded-xl shadow-2xl p-4 max-w-2xl w-full mx-auto mt-20"
>
	{#snippet content()}
		<div class="relative">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400-500 z-10" />
			<Combobox
				data={filteredItems}
				placeholder="Search documentation..."
				onValueChange={handleSelection}
				inputGroupBase="grid-cols-1"
				inputGroupInput="w-full rounded-lg border border-surface-200-700 bg-surface-50-900 py-3 pl-10 pr-4 text-surface-900-50 placeholder-surface-400-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
				inputGroupButton="hidden"
				contentBackground="bg-surface-100-900 border border-surface-200-700"
				contentMaxHeight="max-h-80"
				optionBase="btn justify-start w-full text-surface-900-50"
				optionHover="hover:bg-surface-200-700"
			>
				{#snippet item(option)}
					<div class="flex flex-col">
						<span class="font-medium">{option.label}</span>
						{#if option.description}
							<span class="text-xs text-surface-500-400">{option.description}</span>
						{/if}
					</div>
				{/snippet}
			</Combobox>
		</div>
	{/snippet}
</Modal>
