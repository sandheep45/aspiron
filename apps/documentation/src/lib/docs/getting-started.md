---
title: Getting Started
description: Installation and setup guide
order: 2
---

# Getting Started

This guide will help you set up your development environment and get started with the project.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** 18+ 
- **pnpm** (recommended) or npm
- **Git**

## Installation

### Step 1: Clone the repository

```bash
git clone https://github.com/yourusername/yourproject.git
cd yourproject
```

### Step 2: Install dependencies

```bash
pnpm install
```

### Step 3: Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

### Step 4: Start the development server

```bash
pnpm dev
```

> **Success:** Your application should now be running at http://localhost:5173

## Project Structure

```
yourproject/
├── src/
│   ├── lib/
│   │   ├── components/   # Reusable components
│   │   ├── utils/        # Utility functions
│   │   └── docs/         # Documentation pages
│   ├── routes/           # SvelteKit routes
│   └── app.css          # Global styles
├── static/              # Static assets
└── package.json
```

## Next Steps

- Explore the [Components](/docs/components) documentation
- Learn about [Configuration](/docs/configuration) options
- Check out example projects

> **Warning:** Make sure to configure your environment variables before running in production.
