import { error } from '@sveltejs/kit'
import { docs } from '$docs'
import type { EntryGenerator, PageLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = async () => {
  return docs.map((doc) => ({ slug: doc.slug }))
}

export const load: PageLoad = async ({ params }) => {
  const slug = params.slug

  const modules = import.meta.glob('$docs/*.md', { eager: true })

  for (const [path, module] of Object.entries(modules)) {
    const match = path.match(/\/([^/]+)\.md$/)
    if (match && match[1] === slug) {
      return {
        content: module,
        slug,
      }
    }
  }

  throw error(404, `Documentation page not found: ${slug}`)
}
