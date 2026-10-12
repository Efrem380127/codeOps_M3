# PERF.md — Measured performance

Every number in this document was produced by a real `next build` on this
machine and read out of Next.js's own bundle diagnostics. Nothing here is an
estimate.

## How these numbers were produced

```bash
npm run build
# → .next/diagnostics/route-bundle-stats.json
```

Next.js 16 with Turbopack writes `firstLoadUncompressedJsBytes` and the exact
`firstLoadChunkPaths` for every route. The raw sizes below come straight from
that file; the **gzip** column is those same chunks compressed at level 9, which
is the closer proxy for what a visitor actually downloads (Vercel serves Brotli,
which is a little smaller still).

```js
// The measurement, in full
const s = require("./.next/diagnostics/route-bundle-stats.json");
// for each route: sum chunk byte lengths, and gzipSync(chunk) byte lengths
```

> **Note on the build directory.** The sandbox this was built in blocks
> bulk-deleting `.next`, so verification builds were run with a temporary
> `distDir: ".next-verify"`. That changes only *where* the output is written —
> it has no effect on the bundle graph or the numbers. The setting is reverted
> in the committed `next.config.mjs`.

## Results

First-load JavaScript, per route, after the optimisations described below.

| Route | Raw | Gzip | Over baseline |
|---|---:|---:|---:|
| `/_not-found` | 474 KB | **143 KB** | — (the floor) |
| `/orders` | 475 KB | 144 KB | +1 KB |
| `/sign-in` | 477 KB | 145 KB | +2 KB |
| `/track/[id]` | 481 KB | 146 KB | +3 KB |
| `/prescriptions` | 482 KB | 147 KB | +4 KB |
| `/orders/[id]` | 482 KB | 147 KB | +4 KB |
| `/checkout` | 483 KB | 147 KB | +4 KB |
| `/dispensary` | 487 KB | 148 KB | +5 KB |
| `/` | 490 KB | 150 KB | +7 KB |
| `/medicines/[id]` | 491 KB | 150 KB | +7 KB |
| `/cart` | 496 KB | 152 KB | +9 KB |
| `/medicines` | 533 KB | **164 KB** | +21 KB |
| `/dashboard` | 857 KB | **253 KB** | +110 KB |

**The floor is 143 KB gzip.** That is the React 19 + Next.js 16 client runtime,
the router, `CartProvider` and the header/footer — the price of the framework
and the cart, paid once on every route.

## Finding 1 — a root provider cost 27 KB on every page

This was the one real mistake found by measuring, and it is the most useful
thing in this document.

`QueryClientProvider` was mounted in `app/providers.jsx`, at the root. TanStack
Query is used by **exactly one component** in the entire application —
`app/medicines/PagedCatalogue.jsx`. But a provider in the root layout lands in
the *shared* chunk, so every route paid for it, including `/cart`, `/orders`,
`/sign-in` and the 404 page, none of which query anything.

Moving the provider into `app/medicines/CatalogueQueryProvider.jsx` — imported
only by the route that needs it — put TanStack Query in the `/medicines` chunk
and nowhere else.

| Route | Before | After | Δ |
|---|---:|---:|---:|
| `/_not-found` | 500 KB | 474 KB | **−26 KB** |
| `/` | 517 KB | 490 KB | **−27 KB** |
| `/cart` | 523 KB | 496 KB | **−27 KB** |
| `/checkout` | 509 KB | 483 KB | −26 KB |
| `/dashboard` | 884 KB | 857 KB | −27 KB |
| `/dispensary` | 513 KB | 487 KB | −26 KB |
| `/medicines/[id]` | 518 KB | 491 KB | −27 KB |
| `/orders` | 502 KB | 475 KB | −27 KB |
| `/orders/[id]` | 509 KB | 482 KB | −27 KB |
| `/prescriptions` | 509 KB | 482 KB | −27 KB |
| `/sign-in` | 503 KB | 477 KB | −26 KB |
| `/track/[id]` | 508 KB | 481 KB | −27 KB |
| `/medicines` | 534 KB | 533 KB | −1 KB (still needs it) |

**~27 KB uncompressed / ~9 KB gzip off every route except `/medicines`**, for a
change that touched three files and removed no functionality.

The generalisable rule: **a provider belongs at the lowest point in the tree
that still covers all of its consumers.** `CartProvider` genuinely is global —
the header reads the cart on every route — so it stays at the root. TanStack
Query was not, and it left.

## Finding 2 — Recharts is confined to the one route that needs it

`/dashboard` is +110 KB gzip over the floor. That is Recharts, and it is the
single largest thing in the application.

This is the correct trade, not a problem to fix. Charts only exist on the
staff-only dashboard, the route is never on a customer's critical path, and the
alternative — a charting library loaded everywhere "in case" — is exactly the
mistake described in Finding 1. The page is also behind auth, so the bundle is
downloaded by a handful of pharmacists rather than by every visitor.

If it ever needed to shrink, the lever is `next/dynamic` on the chart components
with `ssr: false`, which would move Recharts out of the first-load bundle and
into a lazily-fetched chunk. It is not done here because the dashboard is
chart-first — deferring the chart would mean the page's main content arrives
last.

## Finding 3 — Server Components keep the catalogue out of the bundle

`/medicines` is only +21 KB gzip over the floor, despite rendering 16 product
cards with images, badges, prices and filtering. That is the boundary working:

- The filtering, the card markup and the `Intl.NumberFormat` price formatting
  run on the server and are **not shipped at all**.
- `FilterShell` is a Client Component, but `MedicineList` arrives as its
  `children` prop, already rendered. So only the toggle logic ships.
- The +21 KB is SWR, the debounced search box, and the paged list.

`BOUNDARY.md` has the full reasoning.

## Rendering strategy and what it costs

| | Routes | Cost |
|---|---|---|
| `○` Static | `/`, `/cart`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image` | Zero server work per request; served from the edge cache |
| `●` SSG | 16 × `/medicines/[id]` | Prerendered at build; static HTML per request |
| `ƒ` Dynamic | Everything else | A server render per request |

`/medicines` is dynamic because it reads `searchParams`. Passing the
`searchParams` promise into a Suspense child does **not** make the route static —
the build output proves it. What the Suspense boundary buys is streaming: the
shell is flushed before the results resolve. See the README, §4.

A related finding from the same investigation: `export const revalidate = 60`
was declared on `/medicines` and did nothing. The production response is
`cache-control: private, no-cache, no-store, max-age=0, must-revalidate` —
a route that reads `searchParams` is never cached, so no revalidation window can
apply. It has been removed. The lesson generalises: **verify caching claims
against the deployed response headers, not against the config.** A `revalidate`
export that cannot take effect is indistinguishable from a working one until you
look at the wire.

The 16 detail pages being `●` SSG is the payoff for `generateStaticParams`: they
are the pages a search engine and a shared link land on, and they cost nothing
per request. `/` is `○` Static and `/medicines/[id]` is `●` SSG; both answer
`cache-control: public, max-age=0, must-revalidate`, which lets Vercel's edge
serve them while browsers revalidate.

## Other measures in place

- **Images** — `next/image` with `formats: ["image/avif", "image/webp"]`,
  explicit `width`/`height` (so no layout shift) and `sizes` on the detail hero.
  Product images are generated PNGs at 400×300, 3.1–3.3 KB each.
- **React Compiler** — `reactCompiler: true` in `next.config.mjs`. The catalogue
  re-renders on every search keystroke; the compiler memoises the list
  components automatically, so there is no hand-written `useMemo`/`useCallback`
  to get wrong.
- **Fonts** — `next/font` self-hosts and subsets, so there is no render-blocking
  request to a font CDN and no layout shift from a late swap.
- **`poweredByHeader: false`** — no free version disclosure.
- **Polling is bounded and conditional** — SWR's `refreshInterval` only runs
  while a live view is mounted, and `SearchBox` passes a `null` SWR key when the
  box is empty so an empty string fires no request at all.
- **The SSE stream self-closes** after a bounded number of ticks, so a forgotten
  tab does not hold a connection open forever.

## What is not optimised

Honest limits, so this document is not read as a clean bill of health:

- **No Lighthouse or field data.** These are bundle measurements. Core Web
  Vitals on real hardware and a real network have not been captured, and
  `firstLoadUncompressedJsBytes` is a build-time proxy, not a user-facing
  metric.
- **No budget enforced in CI.** Nothing fails the build if a bundle grows.
  A real project would add a `size-limit` or Lighthouse-CI gate.
- **The 143 KB floor is untested.** Whether the framework runtime can be
  trimmed further has not been investigated.
- **The data layer is in-memory**, so there is no query latency to measure and
  no cache strategy to tune. Every "fetch" is a synchronous array operation
  behind an `async` signature. This is the number that will change most when
  Module 4 introduces a database.

## Re-running the measurement

```bash
npm run build
node -e "
  const s = require('./.next/diagnostics/route-bundle-stats.json');
  for (const r of (Array.isArray(s) ? s : s.routes))
    console.log(String(Math.round(r.firstLoadUncompressedJsBytes/1024)).padStart(6), r.route);
"
```
