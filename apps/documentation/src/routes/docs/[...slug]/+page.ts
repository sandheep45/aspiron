import { error } from '@sveltejs/kit'
import { docs } from '$lib/docs'
import type { EntryGenerator, PageLoad } from './$types'

export const entries: EntryGenerator = async () => {
  return docs.map((doc) => ({ slug: doc.slug }))
}

export const load: PageLoad = async ({ params }) => {
  const slug = params.slug

  const modules = import.meta.glob('$lib/docs/*.md', { eager: true })

  for (const [path, module] of Object.entries(modules)) {
    const match = path.match(/\/([^/]+)\.md$/)
    if (match && match[1] === slug) {
      const docInfo = docs.find((d) => d.slug === slug)
      return {
        content: module,
        slug,
        previous: docInfo?.previous,
        next: docInfo?.next,
      }
    }
  }

  throw error(404, `Documentation page not found: ${slug}`)
}
