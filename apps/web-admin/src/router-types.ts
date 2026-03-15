import '@tanstack/react-router'

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    breadcrumb?:
      | string
      | ((match: {
          pathname: string
          params: Record<string, string>
          search: Record<string, string>
        }) => string)
  }

  interface LoaderDataRouteOption {
    breadcrumb?: string
  }
}
