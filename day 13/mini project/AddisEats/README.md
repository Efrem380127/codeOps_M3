# Addis Eats - Next.js Mini-Project

## Routes

| URL | File | Strategy |
|---|---|---|
| `/` | `app/page.tsx` | Static (SSG) |
| `/menu` | `app/menu/page.js` | ISR (revalidate: 60s) |
| `/menu/[id]` | `app/menu/[id]/page.js` | Static (SSG via generateStaticParams) |
| `/cart` | `app/cart/page.js` | Static (SSG) |
| `/checkout` | `app/checkout/page.js` | Dynamic (Server-rendered via cookies()) |

## Component Boundary Architecture

- `app/layout.tsx` - Root server component; wraps with client `<Providers>` using composition
- `app/components/Providers.js` - Isolated client provider shell (`"use client"`)
- `app/components/CartProvider.js` - Client Context provider for cart state (`"use client"`)
- `app/menu/layout.js` - Server Component shell; delegates interactivity to `<Counter />`
- `app/menu/Counter.js` - Isolated interactive leaf component (`"use client"`)
- `app/menu/FilterShell.js` - Interactive client wrapper receiving server-rendered dishes via `children` (`"use client"`)
- `app/menu/DishList.js` - Async server component; rendered on the server without shipping to client JS
- `app/menu/NavigationButton.js` - Client button using `useRouter()` (`"use client"`)
- `app/menu/error.js` - Client error boundary (`"use client"`)

## First Load JS & Boundary Measurements

Measured with `next build` (Next.js 16.3.5, Turbopack). The per-route numbers are
read from the build's own diagnostics file, `.next/diagnostics/route-bundle-stats.json`
(`firstLoadUncompressedJsBytes` = every JS chunk a first visit to that route downloads).

| Route | Before | After | Change |
|---|---:|---:|---:|
| `/menu` | 465,742 B | **464,154 B** | **−1,588 B (−1.55 KB)** |
| `/menu/[id]` | 454,746 B | 454,350 B | −396 B |
| `/` | 462,420 B | 462,420 B | 0 |
| `/cart` (baseline, no client code of its own) | 453,552 B | 453,552 B | 0 |

Measured as the code above the framework baseline, `/menu` went from
**+12,190 B** over `/cart` to **+10,602 B** — i.e. the route's own client payload
shrank by about 13%.

- **Before Optimization**:
  - `app/menu/page.js` carried `"use client"` at the top, so the page, its imports and
    every library beneath them joined the client bundle, and the data had to be fetched
    in the browser with a `useState`/`useEffect` pair plus a loading flag and an error branch.
  - `app/menu/layout.js` also carried `"use client"`, so the whole route segment was
    a client boundary.
  - `DishList.js` had no directive of its own but was imported by a client component,
    so it became a client component too and shipped to the browser.
- **After Optimization**:
  - `app/menu/page.js` is an async Server Component that awaits its data; there is no
    fetching hook, no loading flag and no error state left in the route.
  - `"use client"` shifted strictly to leaf components: `Counter.js`, `FilterShell.js`,
    `NavigationButton.js`, `CartProvider.js`, and `error.js`.
  - `DishList.js` runs as a pure Async Server Component streamed inside `FilterShell`
    via `{children}`: zero `DishList` code is bundled in the browser.
  - Root layout and menu layout remain pure Server Components.

### Why the difference is real but modest

The number drops rather than collapses because roughly 453 KB of what a first visit
downloads is the framework and React runtime, which every route pays for whether it is
a Server Component or not. What the boundary move actually changes is the slice on top
of that baseline, and on this route that slice is small: `DishList` renders three
titles and `page.js` is a handful of JSX elements. The saving is therefore ~1.6 KB,
not tens of KB.

The more important gain is not measured in bytes at all:

1. The 2-second `await getDishes()` now runs on the server. The browser no longer waits
   for a request to complete before it can render anything, and the fetch never becomes
   a client-side waterfall.
2. `DishList` ships **no JavaScript**. Proof: its code does not appear in any chunk listed
   in `firstLoadChunkPaths` for `/menu`, and the route's client payload is unchanged if
   the component's markup is expanded.
3. `FilterShell` (the only interactive part) still ships its ~2 KB, and it receives the
   finished server HTML through `children` rather than importing it.

Deleting the directive from a large page would move kilobytes; doing it on a small one
moves hundreds of bytes. The habit — put the directive on the smallest component that
genuinely needs interactivity — is what compounds as the page grows.

## Build Output

```
Route (app)      Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ○ /cart
├ ƒ /checkout
├ ○ /menu                1m      1y
└   /menu/[id]
  ├ ● /menu/1
  ├ ● /menu/2
  └ ● /menu/3

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```