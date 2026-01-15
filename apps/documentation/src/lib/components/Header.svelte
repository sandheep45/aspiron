<script lang="ts">
import { Github, Menu, Search } from '@lucide/svelte'
import { docs } from '$docs'
import ThemeToggle from './ThemeToggle.svelte'

let searchOpen = $state(false)
let mobileMenuOpen = $state(false)
let searchQuery = $state('')

function openSearch() {
  searchOpen = true
}

function closeSearch() {
  searchOpen = false
  searchQuery = ''
}

function toggleMobileMenu() {
  mobileMenuOpen = !mobileMenuOpen
}

const filteredDocs = $derived(
  searchQuery
    ? docs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [],
)
</script>

<header class="sticky top-0 z-40 w-full border-b border-surface-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-surface-700 dark:bg-surface-900/95 dark:supports-[backdrop-filter]:bg-surface-900/60">
	<div class="container mx-auto flex h-16 items-center justify-between px-4">
		<div class="flex items-center gap-6">
			<a href="/" class="flex items-center gap-2 font-semibold">
				<span class="text-xl">📚</span>
				<span class="hidden sm:inline">Docs</span>
			</a>

			<nav class="hidden md:flex items-center gap-4 text-sm">
				<a href="/docs/intro" class="text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100">Introduction</a>
				<a href="/docs/getting-started" class="text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100">Getting Started</a>
			</nav>
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={openSearch}
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-100 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700"
				aria-label="Search"
			>
				<Search class="h-5 w-5 text-surface-500" />
			</button>

			<a
				href="https://github.com"
				target="_blank"
				rel="noopener noreferrer"
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-100 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700"
				aria-label="GitHub"
			>
				<Github class="h-5 w-5 text-surface-500" />
			</a>

			<ThemeToggle />

			<button
				onclick={toggleMobileMenu}
				class="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-surface-100 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700"
				aria-label="Menu"
			>
				<Menu class="h-5 w-5 text-surface-500" />
			</button>
		</div>
	</div>

	{#if mobileMenuOpen}
		<nav class="border-t border-surface-200 bg-white px-4 py-4 dark:border-surface-700 dark:bg-surface-900 md:hidden">
			<ul class="space-y-2">
				{#each docs as doc}
					<li>
						<a
							href="/docs/{doc.slug}"
							class="block rounded-lg px-3 py-2 text-sm text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
						>
							{doc.title}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
</header>

{#if searchOpen}
	<div class="fixed inset-0 z-50 bg-black/50" onclick={closeSearch} role="dialog" aria-modal="true">
		<div
			class="mx-auto mt-20 max-w-2xl rounded-xl bg-white p-4 shadow-2xl dark:bg-surface-800"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="relative">
				<Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search documentation..."
					class="w-full rounded-lg border border-surface-200 bg-surface-50 py-3 pl-10 pr-4 text-surface-900 placeholder-surface-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100 dark:placeholder-surface-500"
					autofocus
				/>
			</div>

			{#if searchQuery}
				<ul class="mt-4 space-y-2">
					{#each filteredDocs as doc}
						<li>
							<a
								href="/docs/{doc.slug}"
								onclick={closeSearch}
								class="block rounded-lg px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-700"
							>
								<div class="font-medium text-surface-900 dark:text-surface-100">{doc.title}</div>
								{#if doc.description}
									<div class="text-xs text-surface-500">{doc.description}</div>
								{/if}
							</a>
						</li>
					{:else}
						<li class="py-4 text-center text-sm text-surface-500">
							No results found for "{searchQuery}"
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/if}
