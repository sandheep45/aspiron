<script lang="ts">
import { Moon, Sun } from '@lucide/svelte'
import { onMount } from 'svelte'

let isDark = $state(false)

function toggleTheme() {
  isDark = !isDark
  document.documentElement.classList.toggle('dark', isDark)
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

onMount(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark = savedTheme ? savedTheme === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark)
})
</script>

<button
	onclick={toggleTheme}
	class="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-200 transition-colors hover:bg-surface-300 dark:bg-surface-700 dark:hover:bg-surface-600"
	aria-label="Toggle theme"
>
	{#if isDark}
		<Sun class="h-5 w-5 text-yellow-500" />
	{:else}
		<Moon class="h-5 w-5 text-surface-600" />
	{/if}
</button>
