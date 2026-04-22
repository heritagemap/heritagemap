# HeritageMap (Next.js)

Next.js 16.2.4 + React 19 + TypeScript 5 + Tailwind CSS v4 + react-map-gl v8.

## Dev Commands

```bash
npm install
npm run dev           # Dev server
npm run build         # Production build
npx tsc --noEmit      # Type check (run before lint/test in CI)
npm run lint          # ESLint
npm test              # Jest + React Testing Library
npm run e2e           # Playwright E2E tests
npm run e2e:smoke     # Playwright smoke tests only
npm run e2e:interaction  # Playwright interaction tests only
npm run e2e:ui        # Playwright with UI mode
```

CI order: `tsc --noEmit` → `lint` → `test` → `build`. E2E workflow runs `build` then `e2e`.

## Runtime Requirements

- Node.js >=24 (Volta pins `24.15.0`)
- No additional local services required; app proxies external APIs via Next.js rewrites.

## Architecture

- **Entry**: `app/layout.tsx` → `app/page.tsx` redirects to map viewport (localStorage or geolocation)
- **Routing**: Next.js App Router
  - `/` — client-side redirect to `/lat/:lat/lon/:lon/zoom/:zoom`
  - `/:id` — server-side fetches monument info, redirects to `/lat/:lat/lon/:lon/zoom/12/:id`
  - `/lat/:lat/lon/:lon/zoom/:zoom/:id?` — main map page (`[[...slug]]` optional catch-all)
  - `/moscow`, `/saint-petersburg`, etc. — short city redirects from `app/lib/constants/shortLinks.ts`
- **Map page** (`app/lat/.../page.tsx`): async Server Component rendering `Map` (client) + optional `Sidebar`
- **Map** (`app/components/Map.tsx`): client component using `react-map-gl/mapbox`, manual `supercluster` clustering
- **Sidebar** (`app/components/Sidebar.tsx`): monument details panel
- **FullInfo** (`app/components/FullInfo.tsx`): image metadata from Commons API via DOMParser
- **Alerts** (`app/components/AlertProvider.tsx`): custom toast context

## API Proxies

Configured in `next.config.ts` rewrites:

- `/_api/heritage` → `heritage.toolforge.org/api/api.php`
- `/_api/heritage_info` → `ru-monuments.toolforge.org/wikivoyage1.php`
- `/_api/ru_monument_image` → `magnus-toolserver.toolforge.org/commonsapi.php`

## Toolchain Quirks

- **Tailwind v4**: CSS-first configuration in `app/globals.css` (`@import "tailwindcss"`, `@theme inline`). No `tailwind.config.js`.
- **Path alias**: `@/*` maps to `./*` in both TypeScript and Jest.
- **Mapbox GL import**: use `react-map-gl/mapbox` (not `react-map-gl`). Geocoder has no types; use `// @ts-expect-error` or `types/mapbox-gl-geocoder.d.ts`.
- **Jest mocks** (`jest.setup.ts`): `mapbox-gl`, `@mapbox/mapbox-gl-geocoder`, and `@/app/components/AlertProvider` are auto-mocked. Unit tests rely on these mocks.
- **Playwright**: config in `e2e/playwright.config.ts`. Runs `npm run dev` automatically. Uses `--use-gl=swiftshader`. Tests are in `e2e/tests/*.spec.ts`. Fixtures in `e2e/fixtures/`.

## CI/CD

- `.github/workflows/ci.yml` — runs typecheck, lint, test, build on push/PR to `main`
- `.github/workflows/e2e.yml` — runs Playwright E2E tests on push/PR to `main`

## Important Notes

- This is NOT the Next.js from training data. Read local docs in `node_modules/next/dist/docs/` before writing code.
