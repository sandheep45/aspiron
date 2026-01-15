<script lang="ts">
import Callout from '$components/Callout.svelte'
import type { PageData } from './$types'

const { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>{data.content.title} - Documentation Hub</title>
	<meta name="description" content={data.content.description || 'Documentation page'} />
</svelte:head>

<article class="prose prose-slate max-w-none dark:prose-invert">
	<data.content.default />
</article>

<div class="mt-8 flex items-center justify-between border-t border-surface-200 pt-8 dark:border-surface-700">
	{#if data.content.previous}
		<a
			href="/docs/{data.content.previous}"
			class="text-sm text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100"
		>
			← Previous
		</a>
	{:else}
		<div></div>
	{/if}
	{#if data.content.next}
		<a
			href="/docs/{data.content.next}"
			class="text-sm text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100"
		>
			Next →
		</a>
	{:else}
		<div></div>
	{/if}
</div>
