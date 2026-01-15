<script lang="ts">
import { AlertTriangle, CheckCircle, Info, XCircle } from '@lucide/svelte'
import { cn } from '$lib/utils/index.ts'

type CalloutType = 'info' | 'success' | 'warning' | 'error'

interface Props {
  type?: CalloutType
  title?: string
  children?: import('svelte').Snippet
}

const { type = 'info', title, children }: Props = $props()

const config = {
  info: {
    icon: Info,
    colors:
      'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
  },
  success: {
    icon: CheckCircle,
    colors:
      'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100 border-green-200 dark:border-green-800',
    iconColor: 'text-green-500',
  },
  warning: {
    icon: AlertTriangle,
    colors:
      'bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-500',
  },
  error: {
    icon: XCircle,
    colors:
      'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100 border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
  },
}

const Icon = config[type].icon
</script>

<div class={cn('my-6 rounded-lg border p-4', config[type].colors)}>
	<div class="mb-2 flex items-center gap-2">
		<Icon class={cn('h-5 w-5', config[type].iconColor)} />
		{#if title}
			<span class="font-semibold">{title}</span>
		{/if}
	</div>
	<div class="text-sm">
		{@render children?.()}
	</div>
</div>
