# HeritageMap (Next.js)

Next.js 16.2.4 + React 19 + TypeScript 5 + Tailwind CSS v4 + react-map-gl v8.

## Dev Commands

```bash
npm install
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # ESLint
npm test         # Jest + React Testing Library
```

## Architecture

- **Entry**: `app/layout.tsx` → `app/page.tsx` (redirects to map with geolocation or last viewport)
- **Routing**: Next.js App Router
  - `/` — restores last viewport from localStorage or requests geolocation, redirects to `/lat/:lat/lon/:lon/zoom/:zoom`
  - `/:id` — server-side fetches monument info, redirects to `/lat/:lat/lon/:lon/zoom/12/:id`
  - `/lat/:lat/lon/:lon/zoom/:zoom/:id?` — main map page with optional sidebar (id from `[[...slug]]`)
  - `/moscow`, `/saint-petersburg`, etc. — short city redirects configured in `next.config.ts`
- **Map**: `app/components/Map.tsx` — functional component with hooks, `react-map-gl/mapbox`, manual `supercluster` clustering
- **Sidebar**: `app/components/Sidebar.tsx` — monument details panel
- **FullInfo**: `app/components/FullInfo.tsx` — image metadata from Commons API via DOMParser
- **Alerts**: `app/components/AlertProvider.tsx` — custom toast context replacing `react-alert`

## API Proxies

Configured via `next.config.ts` `rewrites`:

- `/_api/heritage` → `heritage.toolforge.org/api/api.php`
- `/_api/heritage_info` → `ru-monuments.toolforge.org/wikivoyage1.php`
- `/_api/ru_monument_image` → `magnus-toolserver.toolforge.org/commonsapi.php`

## Type Declarations

- `types/mapbox-gl-geocoder.d.ts` — manual declaration for `@mapbox/mapbox-gl-geocoder`

## Important Notes

- This is NOT the Next.js from training data. Read local docs in `node_modules/next/dist/docs/` before writing code.
- No CI/CD workflow yet.
