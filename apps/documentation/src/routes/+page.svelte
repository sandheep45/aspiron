<script lang="ts">
import { ArrowRight, Book, Code, Layers, Terminal } from '@lucide/svelte'
import { docs } from '$docs'

const features = [
  {
    icon: Terminal,
    title: 'Fast Setup',
    description: 'Get started in minutes with our comprehensive guide',
  },
  {
    icon: Code,
    title: 'Type Safe',
    description: 'Full TypeScript support throughout the codebase',
  },
  {
    icon: Layers,
    title: 'Modern Stack',
    description: 'Built with the latest tools and best practices',
  },
]
</script>

<svelte:head>
	<title>Documentation Hub - Welcome</title>
	<meta name="description" content="Welcome to the documentation hub. Learn how to use our project with comprehensive guides and examples." />
</svelte:head>

<div class="py-12">
	<section class="mb-16 text-center">
		<h1 class="mb-4 text-4xl font-bold tracking-tight text-surface-900 dark:text-surface-100 sm:text-5xl">
			Documentation Hub
		</h1>
		<p class="mx-auto mb-8 max-w-2xl text-lg text-surface-600 dark:text-surface-400">
			Everything you need to know to get started with our project.
			Comprehensive guides, examples, and API references.
		</p>
		<div class="flex justify-center gap-4">
			<a
				href="/docs/intro"
				class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
			>
				Get Started
				<ArrowRight class="h-4 w-4" />
			</a>
			<a
				href="https://github.com"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-lg border border-surface-300 bg-white px-6 py-3 font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
			>
				<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
				</svg>
				View on GitHub
			</a>
		</div>
	</section>

	<section class="mb-16 grid gap-8 sm:grid-cols-3">
		{#each features as feature}
			<div class="rounded-xl border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-800">
				<div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
					<feature.icon class="h-6 w-6" />
				</div>
				<h3 class="mb-2 text-lg font-semibold text-surface-900 dark:text-surface-100">
					{feature.title}
				</h3>
				<p class="text-surface-600 dark:text-surface-400">
					{feature.description}
				</p>
			</div>
		{/each}
	</section>

	<section>
		<h2 class="mb-6 text-2xl font-bold text-surface-900 dark:text-surface-100">
			Documentation
		</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			{#each docs as doc}
				<a
					href="/docs/{doc.slug}"
					class="group flex items-start gap-4 rounded-lg border border-surface-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-surface-700 dark:bg-surface-800 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
				>
					<div class="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400 group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400">
						<Book class="h-5 w-5" />
					</div>
					<div>
						<h3 class="font-semibold text-surface-900 group-hover:text-primary-700 dark:text-surface-100 dark:group-hover:text-primary-300">
							{doc.title}
						</h3>
						{#if doc.description}
							<p class="mt-1 text-sm text-surface-600 dark:text-surface-400">
								{doc.description}
							</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	</section>
</div>
