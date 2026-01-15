export interface Doc {
  slug: string
  title: string
  description?: string
  order: number
}

export interface SearchResult {
  slug: string
  title: string
  description?: string
  content: string
  order: number
}

export interface NavItem {
  label: string
  href: string
  active?: boolean
}
