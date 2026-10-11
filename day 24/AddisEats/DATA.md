# DATA.md — Query Architecture & Data Strategy

This document details every query, rendering boundary, cache key, refresh rule, and architectural justification across the Addis Eats frontend and server layers.

---

## 1. Query & Fetching Inventory

| Query / Flow | Boundary | Cache Key / Route | Refresh Rule | Architectural Reasoning |
|---|---|---|---|---|
| **Menu Catalog** | Server | `getDishes()` in `app/menu/page.js` | ISR (`revalidate: 60s`) | Catalog changes infrequently during operational hours; ISR serves instantaneous cached HTML globally via Edge CDN while updating in the background. |
| **Dish Detail** | Server | `generateStaticParams()` in `app/menu/[id]/page.js` | SSG (Pre-rendered static HTML) | Individual dish pages are completely deterministic; pre-generating all 9 dishes yields zero-millisecond TTFB and maximum SEO discoverability. |
| **Dish Search & Filter** | Client | `/api/dishes?search=${query}&page=${page}` (or `null`) | On-demand (300ms debounce), `keepPreviousData: true` | Setting key to `null` when search is empty stops unnecessary network traffic. 300ms debounce cancels intermediate keystrokes. `keepPreviousData` avoids layout flicker during transitions. |
| **Order History** | Server | `getOrdersForUser(session.id)` in `app/orders/page.js` | Dynamic (`cookies()`) | Strictly private; rendered dynamically on demand to enforce caller ownership and prevent caching of personal customer records. |
| **Single Order Detail** | Server | `getOrderById(params.id)` in `app/orders/[id]/page.js` | Dynamic (`cookies()`) | Ownership gate verifies `order.sessionId === session.id` before rendering. Throws access refusal for unauthorized IDs. |
| **Live Order Status Polling** | Client | `/api/orders/${id}` in `app/orders/OrderStatus.js` | SWR 5s poll (`refreshInterval: 5000`) | Pre-seeded with server `fallbackData` for zero-spinner initial paint. SWR polls every 5 seconds while tab is active, pausing automatically when window is blurred. |
| **Live Delivery SSE Stream** | Server / Client | `/api/orders/[id]/stream` in `app/order-status/LiveOrderStatus.js` | Real-time Server-Sent Events | Pushes live driver courier coordinates across Addis Ababa checkpoints directly to the interactive Leaflet map without continuous HTTP overhead. |
| **Kitchen Dashboard** | Server | `getOrders()` in `app/kitchen/page.js` | Dynamic (`session.role === "staff"`) | Displays incoming tickets and real-time order states strictly for authenticated restaurant kitchen staff. |

---

## 2. Server vs. Client Boundary Architecture

### The Rule
> **Fetch on the server unless the request is triggered by user typing or ongoing live polling.**

```
[Server Component: DishList] (Async Server Component)
       ▲
       │ Streamed via {children}
       ▼
[Client Wrapper: FilterShell] ("use client" - Leaf state: category selection)
```

1. **Why `DishList.js` is a Server Component**:
   It fetches dishes directly from server memory or database without shipping any data-fetching libraries or parsing logic to the client browser bundle.
2. **Why `FilterShell.js` is a Client Component**:
   It only manages local active tab state (`selectedCategory`) and passes server-rendered dishes via React `{children}` composition.
3. **Why `Counter.js` is an Isolated Leaf**:
   The interactive increment/decrement quantity logic is isolated into a tiny leaf component (`"use client"`), keeping parent containers pure Server Components.

---

## 3. Client-Side Data Problems Solved

### A. Zero-Flicker Search with Null Key and Debouncing
- **Null Key**: When search query is empty string (`""`), SWR key evaluates to `null`. SWR does not issue a network request.
- **300ms Debounce**: When a user rapidly types "Shiro", keystrokes reset the debounce timer. Exactly one HTTP request fires 300ms after typing halts.
- **`keepPreviousData: true`**: While the new page or query is in-flight, previous search results stay visible, preventing blank flashes or layout jumping.

### B. Instant First Paint via SWR `fallbackData`
- Client polling components (`OrderStatus.js`) receive initial server-rendered data via props.
- SWR hydrates its cache instantly using `fallbackData: initialOrder`.
- The initial screen renders immediately with complete order status, producing **zero loading spinners** on initial page load.

---

## 4. Mutation & State Synchronization

- **`placeOrder` (Server Action)**:
  - Validates delivery fields against server schema.
  - Links order to authenticated session ID.
  - Calls `revalidatePath("/checkout")` and `revalidatePath("/orders")`.
- **`cancelOrder` (Server Action)**:
  - Validates active session and confirms record ownership (`order.sessionId === session.id`).
  - Sets order status to `"cancelled"`.
  - Revalidates order list and detail paths.
