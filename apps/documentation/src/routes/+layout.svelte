<script lang="ts">
import '../app.css'
import { page } from '$app/stores'
import Header from '$components/Header.svelte'
import Sidebar from '$components/Sidebar.svelte'
import favicon from '$lib/assets/favicon.svg'

const { children } = $props()

const isDocsPage = $derived($page.url.pathname.startsWith('/docs'))
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Documentation Hub</title>
	<meta name="description" content="Comprehensive documentation for our project" />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-surface-900">
	<Header />

	<div class="flex">
		{#if isDocsPage}
			<Sidebar />
		{/if}

		<main class="flex-1">
			<div class="container mx-auto px-4 py-8">
				{@render children()}
			</div>
		</main>
	</div>
</div>
