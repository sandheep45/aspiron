import { useMatches } from '@tanstack/react-router'

export interface BreadcrumbItem {
  label: string
  href: string
  isLast: boolean
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const matches = useMatches()

  const breadcrumbs = matches
    .filter((match) => match.staticData?.breadcrumb)
    .map((match, index, filteredMatches) => {
      const breadcrumb = match.staticData.breadcrumb as string
      const isLast = index === filteredMatches.length - 1

      return {
        label: breadcrumb,
        href: match.pathname,
        isLast,
      }
    })

  return breadcrumbs
}
