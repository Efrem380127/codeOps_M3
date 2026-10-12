# Meds Addis — Online Pharmacy & Same-Day Delivery

A production-shaped online pharmacy for Addis Ababa, built with the Next.js App
Router. Customers browse a catalogue, upload prescriptions for pharmacist
review, pay, and track a courier across the city in real time. Pharmacists get a
dispensary console to verify prescriptions and move orders through fulfilment.

This is the **Day 25 capstone** (reading sheet D50). It shares the *concept* of
the Day 24 capstone — a delivery app with a cart, checkout, live order status and
a courier map — but changes the vertical from food to pharmacy, which is what
makes the domain genuinely different rather than a rename: prescription-only
lines, a pharmacist approval gate, batch numbers and expiry dates, and a stock
ledger that fulfilment decrements.

| | |
|---|---|
| **Stack** | Next.js 16.3.5 (App Router) · React 19 · Turbopack |
| **Data layer** | In-memory seed modules behind `lib/*` accessors |
| **Client data** | SWR (polling, toggled keys) · TanStack Query (paged replacement) |
| **Charts & maps** | Recharts · Leaflet via `react-leaflet` |
| **Validation** | Zod |
| **Styling** | Hand-written design system in `app/globals.css` |
| **Auth** | HMAC-SHA256 signed `httpOnly` session cookie |
| **Docs** | [`AUTH.md`](./AUTH.md) · [`DATA.md`](./DATA.md) · [`PERF.md`](./PERF.md) · [`BOUNDARY.md`](./BOUNDARY.md) · [`FUTURE.md`](./FUTURE.md) |

---

## 1. Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

### Demo accounts

Every seeded account shares the password **`meds2026`**. Passwords are stored as
SHA-256 digests and compared with `timingSafeEqual` — see `lib/auth.js`.

| Role | Email | Can reach |
|---|---|---|
| Customer | `abebe@medsaddis.et` | `/orders`, `/prescriptions`, `/checkout`, `/track/[id]` |
| Customer | `chala@medsaddis.et` | same as above |
| Customer | `sara@medsaddis.et` | same as above |
| Pharmacist | `meron@medsaddis.et` | Everything above, plus `/dispensary` |
| Manager | `dawit@medsaddis.et` | Everything above, plus `/dashboard` |

Sign in at `/sign-in`. Unauthenticated attempts to reach a protected route are
redirected to `/sign-in?next=<original-path>`, and the form sends you back to
where you were going once the credentials check out.

---

## 2. What it does

### Storefront

- **Catalogue** (`/medicines`) — 16 medicines across 9 therapeutic categories.
  Filter chips are real `<Link>`s, so a filtered view is shareable, the back
  button works, and the filtered page is crawlable.
- **Live search** — debounced 300 ms, SWR-backed, with a `null` SWR key while
  the box is empty so no request fires on an empty string.
- **Paged browser** — the same catalogue fetched from the route handler six at a
  time, keeping the previous page on screen while the next one loads.
- **Detail pages** (`/medicines/[id]`) — prerendered per medicine, with dosage,
  side effects, storage, manufacturer, batch and expiry data, plus reviews.

### Cart, checkout and orders

- Cart state lives in a React context and survives a reload via `localStorage`.
- Checkout validates with Zod on the server *and* re-checks every line against
  live stock before it will create an order.
- Orders (`/orders`) list a customer's history; `/orders/[id]` shows one order
  with a status timeline.
- **Live status** — SWR polls every 5 s and an SSE stream
  (`/api/orders/[id]/stream`) pushes updates as the order advances. The stream
  sets `no-transform` and `x-accel-buffering: no` so a proxy cannot buffer it,
  and closes itself after a bounded number of ticks.
- **Cancellation** — only while the order is still `pending`; the server
  re-checks the state inside the action rather than trusting the button.

### Prescriptions

- `/prescriptions` — upload a prescription (prescriber, licence number, issued
  date, a list of medicine IDs, optional notes).
- Each submission enters a lifecycle: `pending → approved | rejected → consumed`.
- A prescription-only line cannot be added to the cart unless the account has an
  **approved** prescription naming that medicine. That check is enforced in
  `lib/catalog.js`/the order action, not in the UI.

### Dispensary (pharmacist only)

- `/dispensary` — a review queue for pending prescriptions, and a fulfilment
  board for orders. Approving or rejecting is a Server Action that revalidates
  the affected paths, so the customer's page updates without a manual refresh.
- Moving an order to `dispensed` decrements stock in the ledger.

### Dashboard (pharmacist only)

- `/dashboard` — revenue and order-count charts (Recharts), a sortable orders
  table, a stock table with low-stock highlighting, and a CSV export.
- Sorting is URL-driven with `aria-sort` on the headers, so a sorted view is
  linkable and screen readers announce the sort state.
- Charts are `aria-hidden` and mirrored by a real `<table>` — the numbers are
  available to assistive tech and to anyone whose browser blocks the canvas.

### Tracking

- `/track/[id]` — a Leaflet map with the courier's position, updated live, plus
  a status timeline. The map is loaded through `next/dynamic` with `ssr: false`
  because Leaflet touches `window` at import time.
- The courier marker is a `CircleMarker`, not a `Marker` — the default `Marker`
  pulls a PNG pin that Next's bundler does not resolve, and the resulting broken
  image is a well-known Leaflet-in-Next.js trap.

---

## 3. Architecture

```
app/
  layout.js                 Providers + Header + Footer (order matters — see §6)
  page.js                   Home: static hero, streamed featured grid
  medicines/                Catalogue, detail pages, search, paging
  cart/ checkout/           Cart and checkout
  orders/ orders/[id]/      Order history and live status
  prescriptions/            Upload and track prescriptions
  dispensary/               Pharmacist review queue + fulfilment board
  dashboard/                Analytics, CSV export, sortable tables
  track/[id]/               Live courier map
  sign-in/                  Session entry point
  actions/                  Server Actions (order.js, prescription.js)
  api/                      Route handlers (catalogue, orders, auth, SSE)
  components/               Shared UI
lib/
  session-token.js          Edge-safe session sign/verify (Web Crypto)
  auth.js                   Node-only: password hashing, authenticate
  session.js                getSession()/requireUser() for Server Components
  catalog.js orders.js      Domain accessors — the only readers of the seed data
  prescriptions.js schema.js csv.js format.js fetcher.js
middleware.js               Edge route protection
```

**The rule that keeps this maintainable:** components never import from
`app/data/`. They call `lib/catalog.js`, `lib/orders.js` or
`lib/prescriptions.js`. When Module 4 swaps the seed modules for a database, the
only files that change are those three. That boundary is written up in
[`DATA.md`](./DATA.md).

---

## 4. Rendering strategy

Each route picks a strategy deliberately; the reason is in a comment at the top
of the file.

| Route | Strategy | Why |
|---|---|---|
| `/` | `○` Static | No Dynamic API in the tree |
| `/cart` | `○` Static | Cart lives in `localStorage` |
| `/medicines/[id]` | `●` SSG | `generateStaticParams` prerenders all 16 |
| `/medicines` | `ƒ` Dynamic | Reads `searchParams` |
| `/checkout`, `/orders`, `/orders/[id]`, `/prescriptions` | `ƒ` Dynamic | Read `cookies()`, scoped to one account |
| `/dispensary`, `/dashboard` | `ƒ` Dynamic | Read `cookies()`, role-gated |
| `/track/[id]`, `/sign-in` | `ƒ` Dynamic | Read `cookies()` |
| `/api/*` | `ƒ` Dynamic | Route handlers |
| `/api/orders/[id]/stream` | `ƒ` Dynamic | A stream must never be cached |
| `/robots.txt`, `/sitemap.xml`, `/opengraph-image` | `○` Static | Generated at build time |

### The `searchParams` trap

`searchParams` is a Dynamic API: a page that reads it is rendered per request.
On `/medicines` that costs a prerendered document, so the page is written to
keep the cost as low as possible — but it does **not** avoid it.

This was measured, not assumed. The page passes the `searchParams` **promise**
down to `<CatalogueResults>`, which awaits it inside its own `<Suspense>`
boundary, on the theory that only that subtree would be dynamic. The build
output disproves it: `/medicines` is still listed as `ƒ (Dynamic)`. Next.js
classifies the whole route as dynamic because the page's props contain a
Dynamic API, regardless of where the value is read. Only Partial Prerendering
(`experimental.ppr`) would keep the shell prerendered, and it is not enabled.

What the Suspense boundary does buy is **streaming**: the shell is flushed to
the browser while the results are still resolving, so the frame paints
immediately instead of the visitor waiting on a blank document. That is worth
keeping, and it is the honest reason the boundary is there.

Going fully static would mean moving filtering into the client — fetch the
catalogue once, filter in a `useMemo`. That trades crawlable, shareable filter
URLs for a static document, which is the wrong trade for a catalogue page. So
the route is dynamic, deliberately, and the filters stay real links.

There is also **no `revalidate` export on this route**. An earlier version
declared `revalidate = 60`, which was a no-op: the deployed route answers with
`cache-control: private, no-cache, no-store, max-age=0, must-revalidate`,
because a route that reads `searchParams` is never cached. A revalidation window
that cannot take effect reads as a caching strategy that does not exist, so it
was removed. This was checked against the production response headers.

---

## 5. Security

Three independent layers, because one is a single point of failure:

1. **Edge middleware** (`middleware.js`) — rejects unauthenticated requests to
   protected paths before a route handler runs.
2. **Server components** — each protected page calls `getSession()` again and
   redirects. Middleware is a convenience; it is not the authorisation check.
3. **Server Actions** — every mutating action re-derives the session from the
   cookie inside the action. A form can be posted by anyone; the action cannot
   assume the page that rendered it was allowed to.

Sessions are HMAC-SHA256 signed cookies (`httpOnly`, `secure` in production,
`sameSite=lax`), verified with a constant-time comparison. `safeRedirect()`
rejects `https://evil.example`, protocol-relative `//evil.example` and the
backslash variant `/\evil.example`, so the `?next=` parameter cannot be used for
an open redirect.

The subtle part: **middleware runs on the Edge runtime, where `node:crypto` does
not exist.** The session primitives therefore live in `lib/session-token.js` and
use Web Crypto (`crypto.subtle`), which works in both runtimes. Password hashing
stays in `lib/auth.js` on `node:crypto`, because it only ever runs in a Node
context. Full write-up and the refusal cases: [`AUTH.md`](./AUTH.md).

---

## 6. Two bugs worth documenting

Both were caught by the production build, and both are the kind of thing that
only shows up when you actually run `next build`.

**The provider boundary.** `Header` renders `CartLink`, and `CartLink` calls
`useCart()`. With `<Header />` rendered as a sibling of `<Providers>` in
`layout.js`, `useCart()` threw `useCart must be used inside a <CartProvider>`
while prerendering every static route — including `/_not-found`. Fix: render the
header and footer *inside* the provider.

```jsx
<Providers>
  <Header />
  {children}
  <Footer />
</Providers>
```

**The Edge runtime.** The build warned that `node:crypto` was unsupported, with
an import trace through `middleware.js` → `lib/auth.js`. Splitting the session
code into an Edge-safe module (Web Crypto) and a Node-only module (password
hashing) removed the warning and the latent runtime failure with it.

---

## 7. Accessibility

Not an afterthought — it is checked in the markup:

- A skip link to `#main` on every page.
- Real `<button>` and `<form>` elements rather than clickable `<div>`s.
- `aria-live` on search results, filter counts and order status, so changes are
  announced.
- `aria-sort` on the dashboard table headers.
- `:focus-visible` rings that are not removed, and 44 px minimum touch targets.
- A `.visually-hidden` utility for context that is needed by a screen reader but
  redundant on screen.
- Charts are `aria-hidden` and backed by real tables.
- Colour is never the only signal: stock and prescription states carry text and
  an icon.

---

## 8. Performance

See [`PERF.md`](./PERF.md) for the measured numbers and the reasoning. In short:

- Images are `next/image` with `avif`/`webp` output and explicit `sizes`.
- The React Compiler is enabled (`next.config.mjs`), which removes the need for
  hand-written `useMemo`/`useCallback` in the list components.
- `poweredByHeader: false`.
- Server Components keep the catalogue's filtering, card markup and price
  formatting out of the browser bundle entirely — only the leaf components that
  need state ship JavaScript.

---

## 9. Known limitations

This is a capstone, not a launched business. The honest list:

- **Data is in-memory.** Orders, prescriptions and stock live in module state
  and reset when the server restarts. There is no database.
- **The courier position is simulated.** `/api/orders/[id]/stream` advances a
  position along a fixed route; there is no real telemetry.
- **Uploads are metadata only.** The prescription form records the prescriber
  and licence number; no file is stored.
- **Payments are not integrated.** Checkout records a payment method and
  completes; no gateway is called.
- **Passwords are seeded, not registered.** There is no sign-up flow.

The MoSCoW triage and the roadmap for each of these: [`FUTURE.md`](./FUTURE.md).

---

## 10. Deployment

Deployed to Vercel and publicly reachable.

| | |
|---|---|
| **Live URL** | **https://meds-addis.vercel.app** |
| **Project** | [`meds-addis`](https://vercel.com/roveltesfaye-3329s-projects/meds-addis) |
| **Scope** | `roveltesfaye-3329s-projects` |
| **Region** | `iad1` (Washington, D.C.) |

Verified after deploy:

| Check | Result |
|---|---|
| `/` | `200` — *Meds Addis — Online Pharmacy & Same-Day Delivery* |
| `/medicines` | `200` — *Medicines \| Meds Addis* |
| `/medicines/med_001` | `200` — *Amoxil 500 — 500 mg \| Meds Addis* (SSG) |
| `/sign-in` | `200` — *Sign in \| Meds Addis* |
| `/robots.txt` | `200` |
| `/orders`, `/dispensary`, `/dashboard`, `/checkout`, `/prescriptions` while signed out | `307` → `/sign-in?next=<path>` — the edge proxy is live |

### Deploying it yourself

```bash
npx vercel --prod
```

### Two things that will bite you on a fresh project

Both were hit during this deployment, and neither is obvious from the error:

1. **A project created with `vercel project add` has no framework preset.** It
   defaults to *Other*, with an output directory of "`public` if it exists, or
   `.`". Vercel still runs `npm run build`, so the log looks completely healthy —
   it compiles all 36 routes — and then serves `public/` as a static site. Every
   route returns a platform-level `404 NOT_FOUND`. Fix:

   ```bash
   npx vercel project update meds-addis --framework nextjs \
     --auto-detect output-directory --auto-detect build-command
   ```

2. **New projects can inherit Vercel Authentication**, which protects *all*
   deployments. The symptom is a `200` that is actually the Vercel login page
   (`x-matched-path: /login`). Fix, then redeploy — the setting only applies to
   new deployments:

   ```bash
   npx vercel project protection disable meds-addis --sso
   ```

### Environment variables

| Name | Required | Purpose |
|---|---|---|
| `SESSION_SECRET` | **Yes, in production** | HMAC key for session cookies. Without it the module falls back to a public constant and logs a warning on boot. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Absolute origin used by `metadataBase`, `sitemap.js` and `robots.js`. Defaults to `http://localhost:3000`, which would put localhost URLs in the sitemap and OG tags. |

```bash
npx vercel env add SESSION_SECRET production
```

Both are set for the live deployment. A missing `SESSION_SECRET` is a warning,
not a crash — deliberately, because a deployment that refuses to boot is worse
than one that boots loudly wrong. But until it is set, anyone who knows the
fallback can forge a session cookie, so it must be set before the URL is shared.

---

## 11. Build verification

```
✓ Compiled successfully
✓ Generating static pages
✓ No type errors
✓ No Edge-runtime warnings
```

`npm run build` is the acceptance test. It catches the provider-boundary and
Edge-runtime classes of bug that `next dev` happily hides.
