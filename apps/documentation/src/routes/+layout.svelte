<script lang="ts">
import '../app.css'
import { page } from '$app/stores'
import Header from '$lib/components/header.svelte'
import Sidebar from '$lib/components/sidebar.svelte'

const { children } = $props()

const isDocsPage = $derived($page.url.pathname.startsWith('/docs'))

let sidebarOpen = $state(false)

function closeSidebar() {
  sidebarOpen = false
}

function openSidebar() {
  sidebarOpen = true
}

$effect(() => {
  if ($page.url.pathname.startsWith('/docs')) {
    closeSidebar()
  }
})
</script>

<svelte:head>
  <link rel="icon" />
  <title>Documentation Hub</title>
  <meta
    name="description"
    content="Comprehensive documentation for our project"
  />
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
