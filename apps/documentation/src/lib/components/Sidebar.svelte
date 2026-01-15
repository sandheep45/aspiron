<script lang="ts">
	import { slide } from 'svelte/transition'
	import { X } from '@lucide/svelte'
	import { Accordion } from '@skeletonlabs/skeleton-svelte'
	import { page } from '$app/stores'
	import { docs } from '$lib/docs'
	import type { Doc } from '$lib/utils/types'

	interface Props {
		isOpen?: boolean
		onClose?: () => void
	}

	let { isOpen = false, onClose }: Props = $props()

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

	function handleLinkClick() {
		onClose?.()
	}
</script>

<aside
	class="fixed inset-y-0 left-0 z-50 w-64 transform border-r border-surface-200-800 bg-surface-50-100 py-4 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:transform-none lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:py-4"
	class:translate-x-0={isOpen}
	class:-translate-x-full={!isOpen}
	aria-label="Sidebar"
>
	<div class="flex items-center justify-between px-4 pb-4 lg:hidden">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-surface-500-400">Documentation</h2>
		<button
			onclick={onClose}
			class="rounded-lg p-2 text-surface-500-400 hover:bg-surface-200-700 hover:text-surface-900-50"
			aria-label="Close sidebar"
		>
			<X class="h-5 w-5" />
		</button>
	</div>

	<div class="hidden px-4 pb-4 lg:block">
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
									onclick={handleLinkClick}
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
