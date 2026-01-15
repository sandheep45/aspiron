import type { Doc } from '$utils/types'

export const docs: Doc[] = [
  {
    slug: 'intro',
    title: 'Introduction',
    description: 'Getting started with our project',
    order: 1,
  },
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Installation and setup guide',
    order: 2,
  },
  {
    slug: 'components',
    title: 'Components',
    description: 'Available components and their usage',
    order: 3,
  },
  {
    slug: 'configuration',
    title: 'Configuration',
    description: 'Configuration options and settings',
    order: 4,
  },
]

export const docsDir = './src/lib/docs'
