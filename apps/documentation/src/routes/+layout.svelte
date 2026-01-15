<script lang="ts">
import '../app.css'

const { children } = $props()

const _isDocsPage = $derived($page.url.pathname.startsWith('/docs'))

let _sidebarOpen = $state(false)

function closeSidebar() {
  _sidebarOpen = false
}

function _openSidebar() {
  _sidebarOpen = true
}

$effect(() => {
  if ($page.url.pathname.startsWith('/docs')) {
    closeSidebar()
  }
})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Documentation Hub</title>
	<meta name="description" content="Comprehensive documentation for our project" />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-surface-900">
	<Header onOpenSidebar={openSidebar} />

	<div class="flex">
		{#if isDocsPage}
			<!-- Backdrop overlay for mobile -->
			{#if sidebarOpen}
				<button
					class="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onclick={closeSidebar}
					aria-label="Close sidebar"
				></button>
			{/if}

			<!-- Sidebar -->
			<Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
		{/if}

		<main class="flex-1">
			<div class="container mx-auto px-4 py-8">
				{@render children()}
			</div>
		</main>
	</div>
</div>
