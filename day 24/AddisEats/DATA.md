# DATA.md: Query Architecture & Data Strategy

This document details every query, rendering boundary, cache key, refresh rule, and architectural justification across the Addis Eats frontend and server layers.

---

## 1. Query & Fetching Inventory

| Query / Flow | Boundary | Source | Refresh Rule | Architectural Reasoning |
|---|---|---|---|---|
| **Menu Catalog** | Server | `dishes` from `app/data/dishes.js`, read in `app/menu/page.js` | Dynamic, per request | The catalogue is small and lives in memory, so the page reads it directly and filters it on the server. The dish grid ships as HTML and no parsing logic reaches the browser. The route is dynamic because the shared layout reads the session cookie for the account menu. |
| **Dish Detail** | Server | `generateStaticParams()` in `app/menu/[id]/page.js` | SSG (pre-rendered static HTML) | Individual dish pages are completely deterministic; pre-generating all 9 dishes yields a fast first byte and maximum SEO discoverability. |
| **Dish Search & Filter** | Client | `/api/dishes?search=${query}` from `app/menu/DishSearch.js` | On-demand (300ms debounce), `keepPreviousData: true` | Setting the SWR key to `null` when the search is empty stops unnecessary network traffic. The 300ms debounce cancels intermediate keystrokes. `keepPreviousData` avoids layout flicker during transitions. |
| **Order History** | Server | `orders` from `app/data/orders.js`, filtered by session in `app/orders/page.js` | Dynamic (`cookies()`) | Strictly private; rendered per request to scope the list to the caller and to avoid caching personal customer records. |
| **Single Order Detail** | Server | `orders.find(...)` in `app/orders/[id]/page.js` | Dynamic (`cookies()`) | The ownership gate compares `order.sessionId` against `session.id` before rendering and refuses anything else. |
| **Live Order Status Polling** | Client | `/api/orders/${id}` from `app/orders/OrderStatus.js` | SWR 3s poll (`refreshInterval: 3000`) | Pre-seeded with the server-rendered order through `fallbackData`, so the first paint carries the full status. SWR then re-reads every 3 seconds while the tab is active. |
| **Live Delivery SSE Stream** | Server / Client | `/api/orders/[id]/stream` from `app/order-status/LiveOrderStatus.js` | Real-time Server-Sent Events | Pushes live driver courier coordinates across Addis Ababa checkpoints to the hand-rolled SVG delivery map without continuous HTTP overhead. |
| **Kitchen Dashboard** | Server | `orders` from `app/data/orders.js`, read in `app/kitchen/page.js` | Dynamic, staff only | `getSession()` redirects a signed-out visitor to sign-in and an explicit gate refuses any non-staff role, so the ticket queue is never rendered to a customer. |

---

## 2. Server vs. Client Boundary Architecture

### The Rule
> **Fetch on the server unless the request is triggered by user typing or ongoing live polling.**

```
[Server Component: app/menu/page.js]  reads the catalogue, filters it, renders the grid
       │
       │ renders one per dish
       ▼
[Client leaf: app/components/FoodCard.js]  ("use client" - holds the add-to-cart action)
```

1. **Why `app/menu/page.js` is a Server Component**:
   It reads the catalogue and filters it in memory, so the dish grid is delivered as HTML and no data-parsing logic is shipped to the browser.
2. **Why `app/menu/DishSearch.js` is a Client Component**:
   It owns the one piece of state the menu actually needs, the search term, and debounces the keystrokes that drive the request.
3. **Why `app/components/FoodCard.js` is the client leaf**:
   Only the add-to-cart action needs to be interactive, so the `"use client"` boundary is pushed down to the card instead of marking the whole menu client-side.

---

## 3. Client-Side Data Problems Solved

### A. Zero-Flicker Search with Null Key and Debouncing
- **Null Key**: When the search query is empty (`""`), the SWR key evaluates to `null`, and SWR issues no network request.
- **300ms Debounce**: When a visitor types quickly, each keystroke resets the debounce timer, so exactly one request fires 300ms after typing stops.
- **`keepPreviousData: true`**: While the next query is in flight, the previous results stay on screen, which prevents blank flashes and layout jump.

### B. Instant First Paint via SWR `fallbackData`
- `app/orders/[id]/page.js` awaits the order on the server and passes it to `OrderStatus` as `fallbackData`.
- SWR hydrates its cache with that value immediately.
- The first screen renders the complete order status, so there is no loading spinner on arrival.

---

## 4. Mutation & State Synchronization

- **`placeOrder` (Server Action)**:
  - Validates the delivery fields.
  - Reads the posted `[{id, quantity}]` selection and re-prices it from the catalogue, so the client cannot set its own price.
  - Links the order to the authenticated session.
  - Calls `revalidatePath("/checkout")`, `revalidatePath("/orders")` and `revalidatePath("/kitchen")`.
- **`cancelOrder` (Server Action)**:
  - Validates the active session and confirms record ownership (`order.sessionId === session.id` or a staff role).
  - Sets the order status to `"cancelled"`.
  - Revalidates the order list and detail paths.
