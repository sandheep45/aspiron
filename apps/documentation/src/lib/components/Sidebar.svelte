<script lang="ts">
import { page } from '$app/stores'
import { docs } from '$docs'
import { cn } from '$utils/index.ts'

const currentPath = $derived($page.url.pathname)

function isActive(href: string): boolean {
  return currentPath === href || currentPath.startsWith(href + '/')
}
</script>

<nav class="w-64 shrink-0 border-r border-surface-200 bg-white py-4 dark:border-surface-700 dark:bg-surface-900">
	<div class="px-4 pb-4">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-surface-500">Documentation</h2>
	</div>
	<ul class="space-y-1 px-2">
		{#each docs as doc}
			<li>
				<a
					href="/docs/{doc.slug}"
					class={cn(
						'block rounded-lg px-3 py-2 text-sm transition-colors',
						isActive(`/docs/${doc.slug}`)
							? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
							: 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100'
					)}
				>
					{doc.title}
				</a>
			</li>
		{/each}
	</ul>
</nav>
