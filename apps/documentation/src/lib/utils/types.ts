export interface Doc {
  slug: string
  title: string
  description?: string
  order: number
  section: string
  previous?: string
  next?: string
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
