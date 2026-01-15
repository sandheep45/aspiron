---
title: Configuration
description: Configuration options and settings
order: 4
---

# Configuration

This page documents the available configuration options for the project.

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Application
APP_NAME=My App
APP_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

# Features
FEATURE_SEARCH=true
FEATURE_DARK_MODE=true
```

## Configuration File

You can also create a `config.ts` file for additional settings:

```typescript
// src/lib/config.ts
export const config = {
  app: {
    name: 'My App',
    url: process.env.APP_URL || 'http://localhost:5173',
    theme: 'skeleton'
  },
  features: {
    search: true,
    darkMode: true,
    rss: false
  },
  social: {
    twitter: '@myapp',
    github: 'myorg/myapp'
  }
};
```

## Theme Configuration

### Dark Mode

Dark mode is enabled by default. You can customize the colors in `tailwind.config.js`:

```javascript
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... more colors
        }
      }
    }
  }
}
```

### Custom Themes

Create custom themes using CSS custom properties:

```css
[data-theme='custom'] {
  --color-primary: #8b5cf6;
  --color-secondary: #64748b;
  --color-surface: #ffffff;
}
```

## Build Configuration

### Vite Config

Customize the Vite configuration in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild'
  }
});
```

### SvelteKit Config

Configure SvelteKit in `svelte.config.js`:

```javascript
import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';

export default {
  preprocess: [
    mdsvex({
      extensions: ['.md', '.svx']
    })
  ],
  kit: {
    adapter: adapter(),
    prerender: {
      entries: ['*']
    }
  }
};
```

## TypeScript Configuration

Customize `tsconfig.json` for your needs:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": false
  }
}
```

> **Warning:** Some configuration options require a server restart to take effect.

## Related

- [Components](/docs/components) - Component documentation
- [Getting Started](/docs/getting-started) - Quick start guide
