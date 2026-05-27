# Frontend Conventions

## Architecture

- **TanStack React Router** (file-based, generates `routeTree.gen.ts` — do not edit manually)
- **Tailwind CSS v4** (no `tailwind.config.js` — uses CSS-based `@theme inline {}` and `oklch()` colors)
- `@/*` maps to `apps/web-admin/src/*`
- All private routes live under `src/routes/_private-routes/` and require auth
- Dashboard is at `src/routes/_private-routes/dashboard/index.tsx`
- Auth via Auth.js JWT with credentials provider (Auth.js catch-all at `src/routes/api/auth/$`)
- SSR enabled via `@tanstack/react-start` with Vite (rolldown-vite)
- React Compiler enabled via `babel-plugin-react-compiler`

## File naming

- `kebab-case.ts` / `kebab-case.tsx`
- Component exports are **named functions** (`function Foo()` then `export { Foo }`), not default exports

## Styling

- Use `cva()` from `class-variance-authority` for variant management
- Use `cn()` from `@/lib/utils` to merge class names
- Tailwind v4: `@import 'tailwindcss'`, `@theme inline {}`, `@custom-variant dark`, `oklch()` color space

## Imports

- `@/*` for local imports (maps to `apps/web-admin/src/*`)
- All local imports must use `@/` absolute paths. No relative imports (`./`, `../`) in hand-authored code.
- Exceptions: `routeTree.gen.ts` is auto-generated and may use relative paths. Barrel files (`index.ts`) re-exporting sibling modules may use relative imports.
- `@aspiron/api-client` / `@aspiron/tanstack-client` for workspace packages
- `lucide-react` for icons

## Types

- Prefer `type` over `interface`
- Use `satisfies Record<Enum, Config>` for type-safe object maps
- Use `React.ComponentType` for icon/component prop references
