<script lang="ts">
import { Accordion } from '@skeletonlabs/skeleton-svelte'
import { page } from '$app/stores'
import { docs } from '$lib/docs.ts'
import type { Doc } from '$lib/utils/types.ts'

const currentPath = $derived($page.url.pathname)

function isActive(href: string): boolean {
  return currentPath === href || currentPath.startsWith(href + '/')
}

function groupBySection(docsList: Doc[]) {
  const groups: Record<string, Doc[]> = {}
  for (const doc of docsList) {
    if (!groups[doc.section]) {
      groups[doc.section] = []
    }
    groups[doc.section].push(doc)
  }
  return groups
}

const sections = $derived(groupBySection(docs))
const sectionEntries = $derived(Object.entries(sections))
</script>

<aside class="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-surface-200-800 bg-surface-50-100 py-4">
	<div class="px-4 pb-4">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-surface-500-400">Documentation</h2>
	</div>

	<Accordion collapsible spaceY="space-y-1" padding="p-0">
		{#each sectionEntries as [sectionName, sectionDocs]}
			<Accordion.Item
				value={sectionName}
				controlBase="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-surface-500-400 transition-colors hover:bg-surface-200-700 hover:text-surface-900-50"
				controlPadding="py-2 px-3"
				panelPadding="py-1 pl-2"
			>
				{#snippet control()}
					{sectionName}
				{/snippet}
				{#snippet panel()}
					<ul class="space-y-1">
						{#each sectionDocs as doc}
							<li>
								<a
									href="/docs/{doc.slug}"
									class={isActive(`/docs/${doc.slug}`)
										? 'block rounded-lg px-3 py-2 text-sm bg-primary-50-900/20 text-primary-700-300'
										: 'block rounded-lg px-3 py-2 text-sm text-surface-600-400 hover:bg-surface-200-700 hover:text-surface-900-50 transition-colors'}
								>
									{doc.title}
								</a>
							</li>
						{/each}
					</ul>
				{/snippet}
			</Accordion.Item>
		{/each}
	</Accordion>
</aside>
