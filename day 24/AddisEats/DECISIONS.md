# DECISIONS.md: Architecture & Engineering Decisions

As required in Week 9 Day 49 (Day 24), these three decision tables establish the architectural constraints before implementation: who may see what, where data is fetched, and the performance budget.

---

## Decision One: Who May See What (Slide 11)

| Route | Who | Protected By | What That Proves |
|---|---|---|---|
| `/menu` | **Everyone** | Nothing | It is public, and should stay indexable. |
| `/orders` | **The owner** | Middleware + page + scoped query | Signed in, and only their own records. |
| `/checkout` | **Any signed-in** | Middleware + page | Signed in: the write checks the rest. |
| `/kitchen` | **Staff only** | Page + role check in every action | Signed in, and permitted. |

> **Write the fourth column**: "Protected by middleware" is not an answer: middleware only proves a cookie exists. Saying exactly what each layer establishes shows where the gap is, and the gap is almost always an action that trusts an ID it was handed.

---

## Decision Two: Where Data is Fetched (Slide 12)

| Data | Where, and Why | Key / Cache Strategy |
|---|---|---|
| **Menu and dishes** | **Server**: public, indexable | Read from `app/data/dishes.js` in `app/menu/page.js` and filtered on the server. The dish grid ships as HTML. The route is dynamic because the shared layout reads the session cookie for the account menu. |
| **Order history** | **Server**: private, scoped to the session | Server Component reads `orders` and keeps only the rows whose `sessionId` matches the caller. |
| **Order status** | **Server first, then polled on the client** | `/api/orders/${id}` via SWR (`refreshInterval: 3000`, seeded with `fallbackData`) |
| **Menu search** | **Client**: triggered by typing, debounced | `/api/dishes?search=${term}` via SWR (300ms debounce, `null` key when blank) |
| **Cart** | **Client store**: it never leaves the browser | React Context, with `[{id, quantity}]` mirrored into `sessionStorage` so a reload survives. Prices are never stored, only re-derived from the catalogue. |

> **Server unless the person triggers it**: That single rule decides four of these five rows. The exceptions are the ones a person types into or that must keep refreshing on their own.  
> **Then seed the exception**: Where a client query is unavoidable, render the first result on the server and pass it in as `fallbackData`. Nobody should watch a spinner for data you already had.

---

## Decision Three: The Performance Budget (Slide 13)

| Measure | Target | Measured | Status | What Moves It |
|---|---|---|---|---|
| **LCP, desktop** | Under 2.5s | 4.0s | Missed | `priority` on the hero is in place; the remaining cost is the client bundle that runs ahead of paint. |
| **LCP, mobile** | Under 2.5s | 8.5s | Missed | The hero source PNG is 1.9 MB and the mobile request derives from it. |
| **CLS** | Under 0.1 | 0.02 | Passed | Explicit `width`/`height` on `<Image>` plus `next/font` metric overrides. |
| **JS payload, `/menu`** | Under 120 kB | 607 kB uncompressed | Missed | Dominated by three framework chunks; the route's own code is under 30 kB. |
| **Largest source asset** | Under 150 kB | 1.9 MB (`hero.png`) | Missed | Re-export at roughly 1600 px in a modern format. |

Full method and breakdown in [PERF.md](PERF.md).

> **Fill the third column twice**: A budget with only the final number in it
> proves nothing. The measured column is the honest starting point; the last
> column is the work still to do.
