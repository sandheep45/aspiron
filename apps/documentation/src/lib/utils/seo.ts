export interface MetaTagsOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

export function generateMetaTags(options: MetaTagsOptions): string {
  const {
    title = 'Documentation Hub',
    description = 'Comprehensive documentation for our project',
    image = '/og-image.png',
    url,
    type = 'website',
    keywords,
    author,
    publishedTime,
    modifiedTime,
  } = options

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="keywords" content="${keywords?.join(', ') || ''}" />`,
    `<meta name="author" content="${author || ''}" />`,
    '',
    '<meta property="og:title" content="' + title + '" />',
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${image}" />`,
    type ? `<meta property="og:type" content="${type}" />` : '',
    url ? `<meta property="og:url" content="${url}" />` : '',
    '',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    '',
  ]

  if (publishedTime) {
    tags.push(
      `<meta property="article:published_time" content="${publishedTime}" />`,
    )
  }
  if (modifiedTime) {
    tags.push(
      `<meta property="article:modified_time" content="${modifiedTime}" />`,
    )
  }

  return tags.filter(Boolean).join('\n')
}

export function generateJsonLd(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): string {
  return generateJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  })
}
