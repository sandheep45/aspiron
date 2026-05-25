# API Client & TanStack Query Conventions

## Package dependency order

```
@aspiron/config  →  @aspiron/api-client  →  @aspiron/tanstack-client  →  apps/web-admin
```

After changing any package, run `just build-packages` which builds in order: config → api-client → tanstack-client. The tanstack-client UMD build has a known resolution issue — verify with `pnpm --filter @aspiron/tanstack-client build`.

## API Client service pattern

Location: `packages/api-client/src/services/<domain>/<name>.service.ts`

```typescript
export const exampleService = {
  getExample: async ({
    args,
    options,
  }: ServiceMethodArguments<PayloadType>): Promise<ResponseType> => {
    const client = getClient(options)
    const response = await client.get<ResponseType>('/path', {
      params: { ...args },
    })
    return response.data
  },
}
```

Rules:
- Exported as a plain object (`const`) with arrow function methods
- Method signature: `methodName({ args, options }: ServiceMethodArguments<T>): Promise<R>`
- Conditionally creates client: `options?.axiosConfig ? createApiClient(config) : apiClient`
- Always returns `response.data`
- Types imported from `@/generated-types` (auto-generated, never edit manually)

## TanStack Query hook pattern

Location: `packages/tanstack-client/src/hooks/<domain>/<name>.ts`

```typescript
export interface UseFooQueryOptions
  extends Omit<UseQueryOptions<ResponseType, Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args?: PayloadType
}

export const useFooQuery = (options?: UseFooQueryOptions) => {
  const providerAxiosConfig = useAxiosConfig()
  return useQuery({
    ...options,
    queryKey: [queryKeys.domain.foo()],
    queryFn: () => {
      const config = options?.axiosConfig || providerAxiosConfig || undefined
      return fooService.getFoo({
        options: { axiosConfig: config },
        args: options?.args,
      })
    },
  })
}
```

Rules:
- Filename matches the service name (`kebab-case.ts`)
- Options type extends `Omit<UseQueryOptions<R, Error>, 'queryFn' | 'queryKey'>` with `axiosConfig?` and `args?`
- Hook name: `use<Name>Query`
- Uses `useAxiosConfig()` from `@/providers/QueryProvider`
- Merges `options?.axiosConfig || providerAxiosConfig || undefined`
- Calls `serviceObject.methodName({ options, args })`

## Mutation hook pattern

Same as query hook but uses `useMutation` and extends `UseMutationOptions`. Wraps the service call in `mutationFn`.

## Query keys

Defined in `packages/tanstack-client/src/types/query-keys.ts`. Hierarchical `as const` tuples:

```typescript
export const queryKeys = {
  domain: {
    all: () => ['domain'] as const,
    lists: () => [...queryKeys.domain.all(), 'list'] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.domain.lists(), { page, limit }] as const,
    details: () => [...queryKeys.domain.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.domain.details(), id] as const,
  },
} as const
```

## Adding a new API feature (checklist)

1. Add Rust DTOs → run `just generate-types`
2. Add API client service in `packages/api-client/src/services/`
3. Add query key in `packages/tanstack-client/src/types/query-keys.ts`
4. Add TanStack hook in `packages/tanstack-client/src/hooks/`, re-export through barrel index
5. Run `just build-packages`
6. Add frontend component using the hook
7. Verify: `pnpm biome check .` and `cargo check --all-targets --all-features`

## API integration flow

```
Rust DTO (#[derive(TS)])  ── just generate-types ──►  Generated TS types
                                                             │
                                                             ▼
                                                API Client service (axios)
                                                             │
                                                             ▼
                                                TanStack Query hook (useQuery)
                                                             │
                                                             ▼
                                                React component
                                                             │
                                                    HTTP GET /api/v1/...
                                                             │
                                                             ▼
                                                Backend route → handler → service → repository → DB
```
