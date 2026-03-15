import { useMatches } from '@tanstack/react-router'

export interface BreadcrumbItem {
  label: string
  href: string
  isLast: boolean
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const matches = useMatches()

  const breadcrumbs = matches
    .filter((match) => {
      const staticBreadcrumb = match.staticData?.breadcrumb
      const loaderBreadcrumb = match.loaderData?.breadcrumb
      return !!staticBreadcrumb || !!loaderBreadcrumb
    })
    .map((match, index, filteredMatches) => {
      const staticBreadcrumb = match.staticData.breadcrumb
      const loaderBreadcrumb = match.loaderData?.breadcrumb

      let label: string

      if (typeof staticBreadcrumb === 'function') {
        label = staticBreadcrumb(match)
      } else if (typeof staticBreadcrumb === 'string') {
        label = staticBreadcrumb
      } else if (typeof loaderBreadcrumb === 'string') {
        label = loaderBreadcrumb
      } else {
        label = ''
      }

      const isLast = index === filteredMatches.length - 1

      return {
        label,
        href: match.pathname,
        isLast,
      }
    })

  return breadcrumbs
}
