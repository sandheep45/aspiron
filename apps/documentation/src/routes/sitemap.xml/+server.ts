import { docs } from '$docs'

export const prerender = true

export async function GET() {
  const baseUrl = 'https://yourdomain.com'

  const pages = [
    { url: baseUrl, changefreq: 'weekly', priority: 1.0 },
    ...docs.map((doc) => ({
      url: `${baseUrl}/docs/${doc.slug}`,
      changefreq: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600',
    },
  })
}
