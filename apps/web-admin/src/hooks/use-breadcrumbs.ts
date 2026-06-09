import { useMatches } from '@tanstack/react-router'

export interface BreadcrumbItem {
  label: string
  href: string
  isLast: boolean
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const matches = useMatches()

  const matched = matches.filter(
    (m) => m.staticData?.breadcrumb || m.loaderData?.breadcrumb,
  )

  const breadcrumbs: BreadcrumbItem[] = matched.map((match) => {
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

    return { label, href: match.pathname, isLast: false }
  })

  const leaf = matched[matched.length - 1]

  // Inject parent breadcrumbs from loader data (array form)
  const parentBreadcrumbs = leaf?.loaderData?.parentBreadcrumbs
  if (
    parentBreadcrumbs &&
    parentBreadcrumbs.length > 0 &&
    breadcrumbs.length > 0
  ) {
    const last = breadcrumbs.pop()
    if (last) {
      for (const parent of parentBreadcrumbs) {
        breadcrumbs.push({
          label: parent.label,
          href: parent.href,
          isLast: false,
        })
      }
      breadcrumbs.push(last)
    }
  }

  // Inject single parent breadcrumb (legacy, used by topics page)
  const parentBreadcrumb = leaf?.loaderData?.parentBreadcrumb
  const parentPath = leaf?.loaderData?.parentPath
  if (parentBreadcrumb && parentPath && breadcrumbs.length > 0) {
    const last = breadcrumbs.pop()
    if (last) {
      breadcrumbs.push({
        label: parentBreadcrumb,
        href: parentPath,
        isLast: false,
      })
      breadcrumbs.push(last)
    }
  }

  if (breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1].isLast = true
  }

  return breadcrumbs
}
