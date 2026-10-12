# DATA.md — The Data Layer, Boundary by Boundary

Meds Addis · IBT College Canada CodeOps · Full Stack · Module 3 Frontend Capstone

Every read and every write in the application, where it runs, what key it uses,
how it refreshes, and why. The organising question throughout is one line from
the reading sheet: **"Where does this id come from?"** If the answer is ever "the
request", the query is wrong.

---

## 1. The boundary rule this application follows

| Runs on | Because |
|---|---|
| **Server Component** | It renders markup that does not change per interaction. The code and the data never reach the browser. This is the default. |
| **Client Component** | It needs state, an event handler, a browser API, or a live subscription. Nothing else qualifies. |
| **Route handler / Server Action** | It writes, or it must set a cookie, or a client component needs to fetch after hydration. |

`"use client"` is placed on the **leaf** that needs it, never on the tree that
contains it. `app/components/FilterShell.jsx` is the worked example: it is a
Client Component that takes `children` already rendered on the server, so
`MedicineList` — with all its filtering and card markup — stays a Server
Component and ships zero JavaScript.

---

## 2. Where data lives

There is no database in Module 3. The fixtures in `app/data/` stand in for one,
and they are shaped the way the Module 4 API will return them so nothing
downstream changes when it arrives:

| File | Holds | Notable shape decision |
|---|---|---|
| `app/data/medicines.js` | 16 lines, 9 categories | `requiresPrescription` gates checkout and drives the dispensary queue |
| `app/data/orders.js` | 18 orders | Stores **no money** — only `{ medicineId, quantity }` per line |
| `app/data/prescriptions.js` | 5 prescriptions | Lifecycle `pending → approved \| rejected` |
| `app/data/users.js` | 5 accounts, 3 roles | Passwords as SHA-256 digests, never clear text |
| `app/data/reviews.js` | 8 reviews | One-to-many off the detail page |

**Orders do not store prices.** `lib/orders.js` resolves each line against the
catalogue on every read and derives the money. A stored total sitting beside a
product price is how fixtures drift out of agreement with the product table — and
in a pharmacy, a wrong total is not a cosmetic bug.

`orderLines()` keeps a line whose medicine has been withdrawn, flags it `missing`,
and prices it at zero rather than dropping it silently. An order that quietly
loses a line is worse than one that admits the line is gone.

---

## 3. Server-side reads

All of these run during the server render. None of them is reachable from the
browser.

| Read | File | Route | Why server |
|---|---|---|---|
| `getMedicines()` | `lib/catalog.js` | `/`, `/medicines` | Public, identical for everyone, cacheable |
| `getMedicineById(id)` | `lib/catalog.js` | `/medicines/[id]` | Prerendered via `generateStaticParams` |
| `getReviewsForMedicine(id)` | `lib/catalog.js` | `/medicines/[id]` | Fetched in `Promise.all` with the medicine |
| `getOrders()` | `lib/orders.js` | `/orders`, `/dispensary`, `/dashboard` | Session-scoped or staff-scoped |
| `getOrdersForUser(userId)` | `lib/orders.js` | `/orders`, `/checkout` | `userId` comes from the session |
| `getOrderById(id)` | `lib/orders.js` | `/orders/[id]`, `/track/[id]` | Ownership checked after the read |
| `getPrescriptionsForUser(userId)` | `lib/prescriptions.js` | `/prescriptions`, `/checkout` | Session-derived `userId` |
| `getPendingPrescriptions()` | `lib/prescriptions.js` | `/dispensary` | Staff only |
| `getSession()` | `lib/session.js` | every private route | Reads `cookies()` |

### The simulated latency, and why it is 250 ms

`lib/catalog.js`, `lib/orders.js` and `lib/prescriptions.js` each `await` a short
timer standing in for the Module 4 network round-trip. It is deliberately small:

- **Long enough** that the Suspense boundaries and loading skeletons are genuinely
  exercised — a 0 ms read means the loading state is never rendered and its bugs
  never surface.
- **Short enough** that it does not distort the numbers in [PERF.md](PERF.md).

The original scaffold used 2000 ms, which was long enough to be visibly slow and
would have made every performance figure meaningless. It was reduced.

---

## 4. Client-side reads

| Read | Component | Key | Refresh rule | Why this transport |
|---|---|---|---|---|
| Session | `app/components/AccountMenu.jsx` | `"/api/auth/session"` | `revalidateOnFocus: true` | Keeps the root layout off `cookies()` so `/medicines` stays static |
| Live search | `app/medicines/SearchBox.jsx` | `"/api/medicines?q=…&pageSize=5"` or **`null`** | on key change, debounced 300 ms | `null` key = no request while the box is empty |
| Paged catalogue | `app/medicines/PagedCatalogue.jsx` | `["medicines", "page", n]` (TanStack) | `staleTime: 30_000` | `keepPreviousData` gives instant page changes |
| Order status | `app/orders/LiveOrderStatus.jsx` | `"/api/orders/<id>"` | `refreshInterval: 5000` | Polling survives a dropped connection with no code |
| Courier position | `app/orders/LiveOrderStatus.jsx`, `app/track/[id]/LiveTracker.jsx` | `EventSource("/api/orders/<id>/stream")` | push, 4 s ticks | One-way stream is exactly SSE's shape |

### Why both SWR and TanStack Query

They are good at different things, and this application uses each where it fits:

- **SWR** is a thin cache around a fetch. It is ideal for **polling** and for keys
  that switch **on and off** — `refreshInterval` and a `null` key are each one
  line.
- **TanStack Query** has first-class support for **replacing a key's data while
  keeping the old data on screen**. `placeholderData: keepPreviousData` is one
  line; with SWR the same behaviour needs manual bookkeeping of the previous key.

Using one library for everything would have been simpler to explain and worse at
both jobs.

### The `null` key, specifically

```js
const key = debounced
  ? `/api/medicines?q=${encodeURIComponent(debounced)}&pageSize=5`
  : null;
```

A `null` key tells SWR not to fetch **at all**. Without it, every keystroke —
including the empty string — fires a request, and clearing the box issues one
more. This is the single most common source of request storms in a search box.

### The debounce

`SearchBox` waits **300 ms** after the last keystroke before it commits the term.
Typing "paracetamol" issues **one** request instead of eleven. `keepPreviousData:
true` keeps the previous results mounted while the new ones are in flight, so the
list does not flicker between keystrokes.

---

## 5. Writes

Every write is a Server Action or a route handler. There is no client-side write
path.

| Write | Where | Session check | Authorisation | Revalidates |
|---|---|---|---|---|
| `placeOrder` | `app/actions/order.js` | ✅ | **re-prices from catalogue**, checks stock, checks prescription ownership | `/orders`, `/dashboard` |
| `cancelOrder` | `app/actions/order.js` | ✅ | **ownership** (`order.userId === user.id`) or staff override | `/orders`, `/orders/[id]`, `/dashboard` |
| `advanceOrder` | `app/actions/order.js` | ✅ | **role** (`isStaff`) | `/dispensary`, `/orders`, `/dashboard` |
| `uploadPrescription` | `app/actions/prescription.js` | ✅ | `userId` taken from session, never the form | `/prescriptions`, `/dispensary` |
| `reviewPrescription` | `app/actions/prescription.js` | ✅ | **role** (`getPharmacistSession()`) | `/dispensary`, `/prescriptions`, `/orders` |
| `POST /api/auth/sign-in` | route handler | — | `safeRedirect()` on `next` | sets the cookie |
| `POST /api/auth/sign-out` | route handler | — | — | clears the cookie |

### The two things `placeOrder` refuses to trust

**1. Prices.** The cart sends only `medicineId` and `quantity`. Every unit price is
re-read from `findMedicine()` on the server:

```js
const medicine = findMedicine(item.medicineId);
if (medicine.stock < item.quantity) return { ok: false, error: "Only … left" };
lines.push({ medicineId: medicine.id, quantity: item.quantity });
```

Editing the cart in DevTools changes what is *displayed*. It cannot change what
the order costs, because the browser's idea of the price is never read.

**2. Whose prescription it is.** A valid prescription id belonging to someone else
is not a valid prescription for you:

```js
if (!prescription || prescription.userId !== user.id) {
  return { ok: false, error: "That prescription does not belong to your account." };
}
```

The prescription gate itself is the field that makes this a pharmacy rather than
a shop: an order containing a `requiresPrescription` line is set to
`pending_verification` unless an **approved** prescription covering **every** such
line is attached.

---

## 6. Rendering strategy per route

| Route | Strategy | Why |
|---|---|---|
| `/` | ○ Static, ISR | Public, identical for everyone |
| `/medicines` | ○ Static + `revalidate: 60` | Public catalogue; ISR smooths stock changes |
| `/medicines/[id]` | ● SSG via `generateStaticParams` | 16 known ids, prerendered at build |
| `/cart` | ○ Static shell | Cart is client state |
| `/checkout` | ƒ Dynamic | Reads `cookies()` |
| `/orders`, `/orders/[id]` | ƒ Dynamic | Reads `cookies()`; per-account |
| `/track/[id]` | ƒ Dynamic | Reads `cookies()`; per-account |
| `/prescriptions` | ƒ Dynamic | Reads `cookies()`; per-account |
| `/dispensary` | ƒ Dynamic | Reads `cookies()`; staff only |
| `/dashboard` | ƒ Dynamic | Reads `cookies()`; manager only |
| `/sign-in` | ƒ Dynamic | Redirects an already-signed-in visitor |
| `/api/orders/[id]/stream` | ƒ `force-dynamic` | A streamed response cannot be cached |
| `/opengraph-image`, `/robots.txt`, `/sitemap.xml` | ○ Static | Generated once at build |

**Reading `cookies()` makes a route dynamic.** That is the whole reason
`AccountMenu` is a client component fetching `/api/auth/session` instead of the
header calling `getSession()`: a cookie read in the root layout would make
**every** route dynamic, and `/medicines` would lose its static rendering and ISR.
The cost is one small request per session; the benefit is a static catalogue.

---

## 7. Cache headers

| Endpoint | Header | Reason |
|---|---|---|
| `GET /api/medicines` | `public, s-maxage=30, stale-while-revalidate=60` | Public data; smooths bursts of search keystrokes |
| `GET /api/orders` | `no-store` | Depends on the caller's session |
| `GET /api/orders/[id]` | `no-store` | Same |
| `GET /api/orders/[id]/stream` | `no-cache, no-transform` + `x-accel-buffering: no` | A proxy that buffers defeats the stream |
| `GET /api/prescriptions` | `no-store` | Private records |
| `GET /api/auth/session` | `no-store` | Session-dependent |

**A response that depends on the session must never be cached.** Every private
endpoint says so explicitly rather than relying on the default.

---

## 8. The prescription lifecycle

```
uploadPrescription (any signed-in user)
        │
        ▼
   ┌─────────┐   reviewPrescription (pharmacist only)
   │ pending │──────────────┬───────────────┐
   └─────────┘              ▼               ▼
                      ┌──────────┐    ┌──────────┐
                      │ approved │    │ rejected │
                      └──────────┘    └──────────┘
                            │               │
             covers the order?          reason shown
                            │            to the patient
                            ▼
                    order → verified
```

An **approved** prescription that covers every prescription-only line in the cart
moves the order straight to `verified`. Anything else — no prescription, a pending
one, or one that does not cover every line — puts the order into
`pending_verification` and into the pharmacist's queue.

A **rejected** prescription always carries a reason of at least ten characters.
That constraint is enforced in `lib/schema.js`, on the server, so it applies
whether the form is used or the action is called from the console.

---

## 9. Query inventory — the one-line summary

| Question | Answer |
|---|---|
| Where does the user id come from? | The **session**, always. Never a query parameter, never a form field. |
| Where do prices come from? | The **catalogue**, re-read on every write. Never the cart payload. |
| Where does the order scope come from? | `isStaff(user)` — a role check, not a `?userId=`. |
| What refreshes the order status? | SWR polling at 5 s, plus SSE while in transit. |
| What refreshes the catalogue? | ISR at 60 s, plus `staleTime` on the client queries. |
| What is never cached? | Anything that depends on the session. |
