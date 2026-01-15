<script lang="ts">
import type { PageData } from './$types'

const { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.content.title} - Aspiron Documentation</title>
	<meta name="description" content={data.content.description || 'Aspiron documentation'} />
</svelte:head>

<article class="prose prose-slate max-w-none dark:prose-invert">
	<data.content.default />
</article>

<div class="mt-8 flex items-center justify-between border-t border-surface-200 pt-8 dark:border-surface-700">
	{#if data.previous}
		<a
			href="/docs/{data.previous}"
			class="text-sm text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100"
		>
			← Previous
		</a>
	{:else}
		<div></div>
	{/if}
	{#if data.next}
		<a
			href="/docs/{data.next}"
			class="text-sm text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100"
		>
			Next →
		</a>
	{:else}
		<div></div>
	{/if}
</div>
