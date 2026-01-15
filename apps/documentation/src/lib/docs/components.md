---
title: Components
description: Available components and their usage
order: 3
---

# Components

This page documents the available components in our library.

## Layout Components

### AppShell

The main application shell component that provides the basic layout structure.

```svelte
<script>
  import { AppShell } from '@skeletonlabs/skeleton-svelte';
</script>

<AppShell>
  {#snippet header()}
    <!-- Header content -->
  {/snippet}
  
  {#snippet sidebarLeft()}
    <!-- Sidebar content -->
  {/snippet}
  
  <!-- Main content -->
</AppShell>
```

### Navigation

A responsive navigation component for sidebar navigation.

```svelte
<script>
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
</script>

<Navigation>
  {#snippet children({ items })}
    {#each items as item}
      <a href={item.href} class="nav-item">{item.label}</a>
    {/each}
  {/snippet}
</Navigation>
```

## UI Components

### Button

Standard button component with multiple variants.

```svelte
<script>
  import { Button } from '@skeletonlabs/skeleton-svelte';
</script>

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="soft">Soft</Button>
```

### Modal

A modal dialog component for displaying content in an overlay.

```svelte
<script>
  import { Modal } from '@skeletonlabs/skeleton-svelte';
</script>

<Modal bind:open={isOpen}>
  <h2 slot="header">Modal Title</h2>
  <p>Modal content goes here</p>
</Modal>
```

## Form Components

### Input

Text input field with various states.

```svelte
<script>
  import { Input } from '@skeletonlabs/skeleton-svelte';
</script>

<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="Password" />
```

> **Note:** All form components support error states and validation feedback.

## Display Components

### Avatar

User avatar component with fallback support.

```svelte
<script>
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
</script>

<Avatar src="/avatar.jpg" alt="User avatar" />
<Avatar name="John Doe" />
```

### Badge

Small badge component for status indicators.

```svelte
<script>
  import { Badge } from '@skeletonlabs/skeleton-svelte';
</script>

<Badge color="primary">New</Badge>
<Badge color="success">Active</Badge>
<Badge color="warning">Pending</Badge>
<Badge color="error">Error</Badge>
```

## Related

- [Configuration](/docs/configuration) - Configure components
- [Getting Started](/docs/getting-started) - Quick start guide
