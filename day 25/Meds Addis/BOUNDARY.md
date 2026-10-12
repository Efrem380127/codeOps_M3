# BOUNDARY.md — Server / Client Component boundary

The single most consequential decision in an App Router codebase is which
components get `"use client"`. Every one of them takes its whole import graph
with it into the browser bundle. This document records where the line is drawn
in Meds Addis and why.

## The rule

> Put the directive on the **leaf that needs state**, never on the tree that
> contains it.

A Client Component can render Server Components — but only if they arrive as
`children` (or any other prop), already rendered. If a Server Component is
*imported* by a Client Component, it stops being a Server Component.

## Where the line is

### Client Components (22)

| File | Why it must be a Client Component |
|---|---|
| `app/providers.jsx` | Wraps `CartProvider` + TanStack `QueryClientProvider` |
| `components/CartProvider.jsx` | Holds cart state in `useState`, persists to `localStorage` |
| `components/AddToCartButton.jsx` | `onClick`, reads cart context |
| `components/CartLink.jsx` | Reads cart context to show the item count |
| `components/Navbar.jsx` | `usePathname()` to mark the active link with `aria-current` |
| `components/AccountMenu.jsx` | Open/close state for the dropdown |
| `components/SignOutButton.jsx` | `useRouter()` + a pending state on submit |
| `components/FilterShell.jsx` | `useState` for the show/hide toggle |
| `components/CheckoutForm.jsx` | Form state + `useActionState` |
| `medicines/SearchBox.jsx` | Debounce timer, `useState`, SWR |
| `medicines/PagedCatalogue.jsx` | Page state + TanStack Query |
| `orders/LiveOrderStatus.jsx` | SWR polling + `EventSource` |
| `orders/CancelOrderForm.jsx` | `useActionState` + confirm state |
| `prescriptions/PrescriptionForm.jsx` | Form state + `useActionState` |
| `dispensary/ReviewQueue.jsx` | Optimistic approve/reject |
| `dispensary/FulfilmentBoard.jsx` | Optimistic status transitions |
| `dashboard/RevenueChart.jsx` | Recharts needs the DOM |
| `dashboard/OrdersChart.jsx` | Recharts needs the DOM |
| `dashboard/DownloadCsvButton.jsx` | Builds a `Blob` and triggers a download |
| `track/[id]/LiveTracker.jsx` | SWR polling + `EventSource` |
| `track/[id]/DeliveryMap.jsx` | Leaflet, loaded via `next/dynamic` with `ssr: false` |
| `sign-in/SignInForm.jsx` | `useActionState` + `useSearchParams` for `?next=` |

Everything else under `app/` is a Server Component.

### The ones that are deliberately *not* client

- **`MedicineList.jsx`** — an Async Server Component. It does the filtering,
  renders the cards and formats the prices. All of that stays on the server.
- **`MedicineCard.jsx`** — static markup. It wraps `AddToCartButton`, and
  because the button is imported by a *Server* Component, only the button's code
  crosses the boundary.
- **`CategoryFilter.jsx`** — the chips are `<Link>`s, not buttons. Filter state
  lives in the URL, so there is no state to hold and no reason to ship it.
- **`Header.jsx`, `Footer.jsx`** — static shell. `Header` deliberately does
  **not** call `getSession()`; reading cookies there would mark every route in
  the application dynamic. The signed-in state is fetched by `AccountMenu` on the
  client instead, which keeps `/` and `/medicines` prerenderable.

## The composition pattern in practice

`/medicines` is the clearest example. The page needs a filter shell that can
hide and show results — that needs `useState`, so it needs a Client Component.

```jsx
// app/medicines/page.js  (Server Component)
<Suspense fallback={<MedicineSkeleton />}>
  <FilterShell label="medicines">        {/* "use client" */}
    <MedicineList q={q} category={category} />   {/* Async Server Component */}
  </FilterShell>
</Suspense>
```

`FilterShell` decides *whether* to show its children. It never sees what they
are — `children` is an opaque, already-rendered React node. So the catalogue
filtering, the card markup and the `Intl.NumberFormat` price formatting all stay
on the server, and `FilterShell` ships as a few hundred bytes of toggle logic.

Importing `MedicineList` *inside* `FilterShell.jsx` would have done the
opposite: it would have dragged the whole catalogue into the browser bundle.

## The two boundary mistakes that actually bit

Both are documented in the README because they are the class of bug that only
`next build` catches:

1. **`<Header />` outside `<Providers>`.** `Header` renders `CartLink`, which
   calls `useCart()`. With the header as a sibling of the provider in
   `layout.js`, `useCart()` threw during prerender of every static route,
   including `/_not-found`. The fix is ordering, not a `"use client"`:

   ```jsx
   <Providers>
     <Header />
     {children}
     <Footer />
   </Providers>
   ```

2. **`node:crypto` reached from the Edge.** `middleware.js` imported
   `lib/auth.js`, which imports `node:crypto`. The build warned; at runtime it
   would have failed. The fix was to split the module — see
   [`AUTH.md`](./AUTH.md).

## Checking the boundary

The build output is the test. Two things to look for:

- A route listed as `○ (Static)` when it should be static means something in its
  tree is reaching for a Dynamic API — `cookies()`, `headers()`, `searchParams`,
  or `useSearchParams()` outside a Suspense boundary.
- `firstLoadUncompressedJsBytes` climbing for a route that only renders text
  means a `"use client"` was placed too high in the tree.

`PERF.md` has the measured numbers.
