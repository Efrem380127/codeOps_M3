# CodeOps M3 — Compliance Review: Days 11–24

**Scope:** Verify that each day's *Exercise* and *Mini-Project* submission matches the requirements in that day's reading-sheet PDF.  
**Workspace:** `C:/Users/Roba/Documents/IBT/codeOps_M3`  
**Date of review:** 2026-10-11  
**Method:** PDF text extracted and requirements enumerated → source inspected (app router tree, components, route handlers, server actions, docs) → evidence recorded per requirement. No builds were run; verdicts are static-analysis based.

---

## 0. Day ↔ PDF mapping (important)

Your note is confirmed: **folder `day N` ↔ reading sheet `D(N+25)`** (day 11 = D36 … day 24 = D49, day 25 = D50).

Three PDFs are **filed in the wrong folder**, although the *code inside those folders matches the correct day*:

| Folder   | PDF actually inside         | PDF that belongs there      | Content verdict                                 |
| -------- | --------------------------- | --------------------------- | ----------------------------------------------- |
| `day 19` | D45 NextJS Advanced Project | **D44 Metadata & SEO**      | content *is* SEO work → belongs to D44          |
| `day 20` | D45 + D46                   | D45 (correct) + D46         | content *is* the advanced project → D45 correct |
| `day 21` | D44 Metadata & SEO          | **D46 Data Representation** | content *is* dashboard/charts → belongs to D46  |

**Conclusion:** this is a file-placement issue, not a submission issue. The code under `day 19` implements D44, `day 20` implements D45, `day 21` implements D46. Rename/move the three PDFs to avoid confusion at assessment.

---

## 1. Cross-cutting findings (affect many days)

| #  | Finding                                                                                                                                                                                                                                                        | Severity   | Evidence                                                                                                                                                                |
| -- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1 | **Stray `/Home` route** exists in *every* day 11→24 app, including the capstone. The briefs' "Check yourself" explicitly asks *"does `npm run build` list every route you expected, and no routes you did not?"*                                               | Medium     | `*/app/Home/page.js` present in all 14 days; visible in the build output pasted in `day 12/…/README.md` (`├ ○ /Home`) and `day 23/mini project/README.md` (`├ ○ /Home`) |
| C2 | **`package.json` name is `"book-store"` everywhere** — including the AddisEats mini-projects and the day 24 capstone                                                                                                                                           | Low        | `day 22`, `day 23`, `day 24` `package.json` all `"name": "book-store"`                                                                                                  |
| C3 | **"book-store" exercise is largely an un-rebranded copy of AddisEats.** Same component set, only strings differ. In several days the exercise even mixes domains (Book list says "Available Books / Book 1–3" while `menu/[id]` serves *Shiro / cake / Pasta*) | Low–Medium | `day 11/excersise/book-store/app/menu/DishList.js` vs `day 11/excersise/book-store/app/menu/[id]/page.js`                                                               |
| C4 | Docs are consistently strong where the brief demands them (`STRATEGY.md`, `BOUNDARY.md`, `AUTH.md`, `DATA.md`, `PERF.md`, `VERIFICATION.md`, `.env.example`, `.gitignore`) — this is the strongest part of the submission                                      | —          | see per-day notes                                                                                                                                                       |
| C5 | `day 15/ethiojobs/` is an **empty directory**. The real capstone lives at `Nextjs_project/ethiojobs` (which is where the D45 sheet says it should be)                                                                                                          | Info       | `du -sh day 15/ethiojobs` → 4.0K, no files                                                                                                                              |

---

## 2. Per-day verdicts

Legend: ✅ met · ⚠️ met with a deviation · ❌ not met

### Day 11 — D36 · Next.js Intro & File-Based Routing

| Item                                                                    | Verdict | Evidence                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exercise: scaffold + home/menu/cart/checkout routes                     | ✅       | `app/page.tsx`, `app/menu/page.js`, `app/cart/page.js`, `app/checkout/page.js`                                                                                                                                                    |
| Dynamic `[id]` + `notFound()`                                           | ✅       | `app/menu/[id]/page.js` calls `notFound()`                                                                                                                                                                                        |
| `loading.js` / `error.js` on menu segment; `error.js` is `"use client"` | ✅       | `day 11/…/app/menu/error.js:1`                                                                                                                                                                                                    |
| `next/link` everywhere + a client component pushing with `useRouter`    | ✅       | `NavigationButton.js` uses `useRouter().push("/cart")`                                                                                                                                                                            |
| README listing each route and the file that produces it                 | ⚠️      | mini-project README has the route table; **exercise README is still the default create-next-app boilerplate**                                                                                                                     |
| Home route actually renders the Menu                                    | ❌       | `day 11/excersise/book-store/app/page.tsx` returns **`<menu/>`** (lowercase). React treats it as the HTML `<menu>` element, so the home page renders **empty** and `Menu` is never imported. The mini-project version is correct. |

### Day 12 — D37 · Layouts & Rendering Strategies

| Item                                                                | Verdict | Evidence                                                                                                                                                                                |
| ------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root layout owns `html`/`body`, imports global CSS, header + footer | ✅       | `day 12/…/app/layout.tsx`                                                                                                                                                               |
| Nested menu layout with sidebar + counter proven to persist         | ✅       | `app/menu/layout.js` (`"use client"` + `useState` counter)                                                                                                                              |
| Menu on a justified `revalidate`, still static in build             | ✅       | `app/menu/page.js:7` `export const revalidate = 60`; build output shows `○ /menu 1m 1y`                                                                                                 |
| `generateStaticParams` on dish route                                | ✅       | `app/menu/[id]/page.js:9`                                                                                                                                                               |
| Checkout forced dynamic **with a comment naming the read**          | ⚠️      | `app/checkout/page.js` reads `cookies()` → build output `ƒ /checkout` ✅, but **there is no code comment** naming the read (the requirement asks for it; only `STRATEGY.md` mentions it) |
| Suspense streaming dish list behind instant sidebar                 | ✅       | `app/menu/page.js:23` `<Suspense fallback=…>`                                                                                                                                           |
| `STRATEGY.md` + build output pasted in README                       | ✅       | both present and consistent with the build markers                                                                                                                                      |

### Day 13 — D38 · Server & Client Components

| Item                                                                  | Verdict | Evidence                                                                                                 |
| --------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| Menu/dish routes as async server components, no fetching hooks        | ✅       | `DishList.js` is an async server component                                                               |
| `"use client"` only on the smallest components                        | ✅       | `Counter.js`, `FilterShell.js`, `NavigationButton.js`, `CartProvider.js`, `error.js`                     |
| `Providers` client component wrapping `children`, layout stays server | ✅       | `app/components/Providers.js`                                                                            |
| Client shell receiving server content via `children`                  | ✅       | `FilterShell` receives `<DishList/>` as children                                                         |
| `BOUNDARY.md` with per-component side + justification                 | ✅       | complete 17-row table                                                                                    |
| **Before/after First Load JS figures for `/menu` in README**          | ❌       | README §"First Load JS & Boundary Measurements" describes the change **qualitatively only — no numbers** |


### Day 14 — D39 · API Routes & Route Handlers

| Item                                               | Verdict | Evidence                                                  |
| -------------------------------------------------- | ------- | --------------------------------------------------------- |
| `GET /api/dishes` (+ `[id]` with 404)              | ✅       | `app/api/dishes/route.js`, `app/api/dishes/[id]/route.js` |
| `POST /api/orders` → 422 `fieldErrors` / 201       | ✅       | `day 14/…/app/api/orders/route.js:9,21`                   |
| `placeOrder` server action + `useActionState`      | ✅       | `app/actions/order.js`, `app/checkout/CheckoutForm.js`    |
| `revalidatePath` after write                       | ✅       | `app/actions/order.js:39-40`                              |
| `cancelOrder` verifying session **and** ownership  | ✅       | `app/actions/order.js:55,64`                              |
| `.env.local` gitignored, no secret in client       | ✅       | `.gitignore` present from day 17                          |
| README listing each endpoint, method, status codes | ✅       | `day 14/…/README.md:57-61`                                |

### Day 15 — D40 · Next.js Foundations Project

| Item                                                            | Verdict | Evidence                                                                                                                                                                                                                                     |
| --------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Five routes as folders, nested layouts, all special files       | ✅       | `day 15/addis-eats/app/`                                                                                                                                                                                                                     |
| Strategy per route matching build markers                       | ✅       | `day 15/addis-eats/README.md` route table                                                                                                                                                                                                    |
| Server components fetching; `"use client"` on leaves only       | ✅       | `app/components/FoodCard.js`, `DishList.js`                                                                                                                                                                                                  |
| One route handler + one server action, shared schema validation | ✅       | `app/actions.js` (`placeOrder`), `/api/orders`                                                                                                                                                                                               |
| `STRATEGY.md` + `BOUNDARY.md` + build output in README          | ✅       | `STRATEGY.md`, `BOUNDARY.md`, `DESIGN.md`, `SEO.md` present                                                                                                                                                                                  |
| Capstone (EthioJobs) migrated to Next.js                        | ⚠️      | **`day 15/ethiojobs/` is empty**; the capstone is at `Nextjs_project/ethiojobs` with `AUTH/BOUNDARY/DATA/PERF/README/STRATEGY.md` ✅. Location matches the D45 sheet, so the deliverable exists — only the empty placeholder folder is noise. |

### Day 16 — D41 · Data Fetching (SWR & React Query)

| Item                                                          | Verdict  | Evidence                                                                                                                                 |
| ------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Shared `lib/fetcher.js` used by every query, throws on non-OK | ✅        | `app/lib/fetcher.js`                                                                                                                     |
| Order status server-rendered **and polled every 5 s**         | ✅ (mini) | `day 16/mini project/…/app/orders/OrderStatus.js:9` `refreshInterval: 5000`                                                              |
| `fallbackData` so no first-paint spinner                      | ✅        | `order-status/page.js:15`, `orders/page.js:21`                                                                                           |
| Debounced search, null key, `keepPreviousData`                | ✅        | `app/menu/DishSearch.js:19-34`                                                                                                           |
| Paging with page in the query string                          | ✅        | `DishSearch.js:16,28,49-53`; `api/dishes/route.js`                                                                                       |
| `DATA.md` with key + refresh rule + reasoning                 | ✅        | complete query inventory table                                                                                                           |
| Poll interval in the **exercise**                             | ⚠️       | `day 16/excersise/book-store/…/OrderStatus.js:9` uses `refreshInterval: 3000` while the mini-project uses 5000 (brief says five seconds) |

### Day 17 — D42 · Middleware & Authentication

| Item                                                                   | Verdict | Evidence                                                                  |
| ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| Session cookie `httpOnly` + `secure` + `sameSite`, `getSession` helper | ✅       | `lib/auth.js:84-86`                                                       |
| Middleware with **narrow** matcher, remembers destination              | ✅       | `middleware.js:11,18` `matcher: ["/checkout","/orders","/orders/:path*"]` |
| `next` param validated so absolute URLs are rejected                   | ✅       | `app/actions/auth.js:27` `startsWith("/") && !startsWith("//")`           |
| Private pages verify session while rendering                           | ✅       | e.g. `app/orders/page.js`                                                 |
| Queries scoped to session id                                           | ✅       | `orders.filter(o => o.sessionId === session.id …)`                        |
| Session + ownership inside every writing action                        | ✅       | `app/actions/order.js`                                                    |
| `AUTH.md` + three documented attacks                                   | ✅       | `AUTH.md` present                                                         |
| `.env.example`                                                         | ✅       | present from day 17 onward                                                |

### Day 18 — D43 · Optimisation & Environment

| Item                                                                     | Verdict | Evidence                                                          |
| ------------------------------------------------------------------------ | ------- | ----------------------------------------------------------------- |
| Lighthouse before/after on a production build                            | ✅       | `PERF.md` two-column budget (61 → 98; LCP 4.6 s → 1.3 s)          |
| Every image via `next/image` with width/height/sizes/alt                 | ✅       | `app/menu/DishList.js:1`, `app/menu/[id]/page.js`                 |
| `priority` on exactly one image, remote hosts listed                     | ✅       | `app/page.tsx:19` single `priority`; `next.config` remotePatterns |
| `next/font` replacing link tags                                          | ✅       | `app/layout.tsx:1` `next/font/google`                             |
| Third-party script via `next/script`                                     | ✅       | `app/layout.tsx:2,49-52` `strategy="lazyOnload"`                  |
| `.env.example` committed, `.env*.local` ignored, no `NEXT_PUBLIC` secret | ✅       | `.gitignore:34-37` (`.env*` + `!.env.example`)                    |
| `PERF.md` with cause of each change                                      | ✅       | detailed per-change breakdown                                     |

### Day 19 — (content for) D44 · Metadata & SEO

| Item                                                 | Verdict | Evidence                                                                    |
| ---------------------------------------------------- | ------- | --------------------------------------------------------------------------- |
| `metadataBase` + title template in root layout       | ✅       | `app/layout.tsx:17-21`                                                      |
| Distinct human-readable description per route        | ✅       | per-page `metadata` exports incl. `orders`, `order-status`                  |
| `generateMetadata` on dish route from the record     | ✅       | `app/menu/[id]/page.js:9-39`                                                |
| Site-wide OG image + generated per-dish 1200×630     | ✅       | `app/opengraph-image.js`, `app/menu/[id]/opengraph-image.js`                |
| `MenuItem` JSON-LD matching the page price           | ✅       | `page.js:49-67` (name + `price` + `priceCurrency: "ETB"`)                   |
| `sitemap.js` from real data, private routes excluded | ✅       | `sitemap.js` — only `/`, `/menu`, `/order-status`, dishes                   |
| `robots.js` disallowing `/cart`, `/checkout` …       | ✅       | `robots.js:8` disallows `/cart`,`/checkout`,`/orders`,`/kitchen`,`/sign-in` |
| Canonical on query-parameter routes                  | ✅       | `alternates.canonical` on `/orders`, `/order-status`, `/menu/[id]`          |


### Day 20 — (content for) D45 · Next.js Advanced Project

| Item                                                | Verdict | Evidence                                                                                       |
| --------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| Sessions + three protection layers + scoped queries | ✅       | `lib/auth.js`, `middleware.js`, `app/actions/order.js:57,66`                                   |
| Polled query + debounced search                     | ✅       | `DishSearch.js`, `OrderStatus.js`                                                              |
| Measured performance improvement documented         | ✅       | `PERF.md` (identical two-column budget to day 24)                                              |
| Metadata / previews / sitemap / JSON-LD             | ✅       | `sitemap.js`, `robots.js`, `opengraph-image.js`                                                |
| Documentation set                                   | ✅       | `AUTH, BOUNDARY, DATA, DECISIONS, DESIGN, FINDABLE, PERF, SEO, STRATEGY, VERIFICATION, README` |

### Day 21 — (content for) D46 · Data Representation

| Item                                                   | Verdict | Evidence                                                                            |
| ------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------- |
| Aggregation on the server, only summaries crossing     | ✅       | `app/orders/page.js` builds `revenueByNeighbourhood` / `ordersOverTime` server-side |
| Charts as client leaves, heading + unit + fixed height | ✅       | `NeighbourhoodBarChart.js`, `OrdersOverTimeLineChart.js`                            |
| Every chart accompanied by the same data in a table    | ✅       | `NeighbourhoodDataTable.js`, `OrdersTimeDataTable.js`                               |
| Real table markup: `table/caption/thead/th scope`      | ✅       | `OrderTable.js:71-221`                                                              |
| Sorting **and** paging in the URL, paging via `Link`   | ✅       | `OrderTable.js:16-37, 299-405`; `aria-sort` on headers                              |
| Loading, empty, error states each demonstrable         | ✅       | `?state=loading\|empty\|error\|populated` switcher in `page.js:252-300`             |

### Day 22 — (content for) D47 · Maps, Real-Time & Data Formats

| Item                                                                    | Verdict | Evidence                                                                                                                                                                                                            |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Map loaded `ssr:false`, sized placeholder, attribution kept             | ✅       | `LiveDeliveryTracking.js:9-12`; `DeliveryMap.js` imports `leaflet.css`, OSM attribution                                                                                                                             |
| Same delivery info available as text beside the map                     | ✅       | courier/address/GPS/ETA block in `LiveDeliveryTracking.js:343-409`                                                                                                                                                  |
| Stream route handler using `data: ` + two newlines                      | ✅       | `app/api/orders/[id]/stream/route.js:83`, `Content-Type: text/event-stream`                                                                                                                                         |
| `EventSource` seeded from server data, closed on unmount, visible state | ✅       | `LiveDeliveryTracking.js:19-50`, connection badge                                                                                                                                                                   |
| `lib/format.js` exporting `etb`, `when`, `relative`, built once         | ✅       | module-level formatter instances                                                                                                                                                                                    |
| CSV export quoting commas, quotes, newlines                             | ✅       | `lib/csv.js:6-8`                                                                                                                                                                                                    |
| **Time zone / locale naming**                                           | ⚠️      | `format.js` uses `"en-US"` and **no `timeZone: "Africa/Addis_Ababa"`**, and `etb()` appends `" ETB"` instead of `style:"currency"`. The brief explicitly warns that an unnamed time zone causes hydration mismatch. |

### Day 23 — (content for) D48 · Event Handling & Deployment

| Item                                                                       | Verdict | Evidence                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No clickable divs — everything a button or link                            | ✅       | grep for `<div\|<span\|<li` + `onClick` across day 23/24 → **no matches**                                                                                                                                                                                                                           |
| Visible focus everywhere, keyboard-reachable                               | ✅       | global `:focus-visible` + skip link (documented in README)                                                                                                                                                                                                                                          |
| Forms via `onSubmit`, submit disabled while pending                        | ✅       | `CheckoutForm.js` `onSubmit={handleSubmit}`, `disabled={isPending}` + `useActionState`                                                                                                                                                                                                              |
| Touch targets ≥ 44 px, nothing behind hover                                | ✅       | `minHeight/minWidth: "44px"` across `CategoryBar`, `Counter`, `FilterShell`, `SignInForm` …                                                                                                                                                                                                         |
| Clean `npm run build`, pre-flight checklist                                | ✅       | route table pasted in README                                                                                                                                                                                                                                                                        |
| Deployed with per-environment variables, post-deploy checks, URL in README | ✅       | `https://addis-eats-six.vercel.app` + rollback instructions                                                                                                                                                                                                                                         |
| **Exercise vs mini-project distinctness**                                  | ❌       | `diff -rq day 23/excersise/book-store/app day 23/mini project/AddisEats/app` → **0 differences**; even `layout.tsx` is byte-identical. The "book-store" exercise is literally the AddisEats app with no rebranding, and day 23's docs are thin (only `DATA.md` + `README.md` vs day 22's full set). |

### Day 24 — D49 · Frontend Capstone Build

| Item                                                   | Verdict | Evidence                                                                                                                                                      |
| ------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live URL in README                                     | ✅       | `https://addis-eats-six.vercel.app`                                                                                                                           |
| Five documents: `README / AUTH / DATA / PERF / FUTURE` | ✅       | all present (+ `BOUNDARY, DECISIONS, DESIGN, FINDABLE, SEO, STRATEGY, VERIFICATION`)                                                                          |
| Three attacks refused, with the stopping line named    | ✅       | `app/actions/order.js:57-59` (no session), `:66-68` (not owner); `app/actions/auth.js:27-29` (open redirect) — cited line numbers **verified against source** |
| PERF budget with both columns                          | ✅       | `PERF.md` before/after table                                                                                                                                  |
| Empty/loading/error states                             | ✅       | present across `orders/`, `menu/`                                                                                                                             |
| Keyboard + 44 px + no double submit                    | ✅       | ref-lock + `disabled={isPending}`                                                                                                                             |
| Stray `/Home` route still shipped                      | ⚠️      | `day 24/AddisEats/app/Home/page.js` — an unintended public route in the final deliverable (see C1)                                                            |


## 4. Recommended fixes (highest value first)

1. **Day 11 exercise** — change `app/page.tsx` to `import Menu from "./menu/page"; … return <Menu />;` (or inline the menu markup). The `/` route currently renders nothing.
2. **Day 23 exercise** — either rebrand it as a genuine Book Store app, or replace the exercise with a distinct deliverable. As submitted it is not a separate piece of work.
3. **Day 13** — record actual `First Load JS` numbers for `/menu` before and after in the README (the build output table gives the "after" column for free).
4. **Day 12** — add the comment above the `cookies()` read in `app/checkout/page.js` naming why the route must be dynamic.
5. **All days** — delete `app/Home/page.js`. It publishes an unintended `/Home` route and contradicts the "no routes you did not expect" check in the sheets; it is still present in the day 24 capstone.
6. **Day 22** — add `timeZone: "Africa/Addis_Ababa"` to `whenFormatter` and use `style: "currency", currency: "ETB"` in `etb()`.
7. **Housekeeping** — move the three mis-filed PDFs (`day 19`, `day 20`, `day 21`) to the folders they belong to; remove the empty `day 15/ethiojobs/`; set `package.json` `name` to `addis-eats` in the mini-projects and capstone.

---

## 5. Fixes applied — 2026-10-11

All seven recommended fixes were applied, together with several defects that surfaced while doing so. Where a build could meaningfully verify a change, one was run and is cited as evidence.

### 5.1 The recommended fixes

| # | Finding                                                                    | Fix applied                                                                                                                                                                                                                                      | Verified                                             |
| - | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| 1 | Day 11 exercise `/` rendered nothing (`<menu/>`)                           | `app/page.tsx` rewritten as a real home component that imports `next/link` and links to `/menu`; the create-next-app default metadata replaced with `title: "Book Store"`. The same `<menu/>` bug was found and fixed in days **12, 13 and 14**. | `npm run build` — 7 pages generated, 0 type errors   |
| 2 | Day 23 exercise byte-identical to the mini-project                         | Rebranded end to end as a **Book Store** (see §5.2) and its `README.md` rewritten as a D48 *exercise* deliverable. It is no longer a copy of anything.                                                                                           | `npm run build` — 25 pages generated, 0 type errors  |
| 3 | Day 13 README had no First Load JS figures                                 | Real before/after numbers measured and recorded (see §5.3).                                                                                                                                                                                      | two `npm run build` runs + `route-bundle-stats.json` |
| 4 | Day 12 checkout had no comment naming the `cookies()` read                 | Comment added directly above the read.                                                                                                                                                                                                           | —                                                    |
| 5 | Stray `/Home` route in every app                                           | **40** `app/Home` directories removed across days 11–24 (including the day 24 capstone and a nested worktree copy). Confirmed absent from the rebuilt route tables.                                                                              | builds for days 11, 13, 19, 23                       |
| 6 | Day 22 `lib/format.js` had no named time zone and hand-rolled the currency | Locale set to `en-ET`, `timeZone: "Africa/Addis_Ababa"` added, and `etb()` now uses `style: "currency", currency: "ETB"`.                                                                                                                        | —                                                    |
| 7 | Housekeeping                                                               | D44 moved to `day 19/`, D46 moved to `day 21/`, the duplicate D45 set aside; empty `day 15/ethiojobs/` removed; **48** `package.json` `name` fields corrected.                                                                                   | —                                                    |

Also applied from the cross-cutting findings:

- **C2/C3 — the exercise track was half-rebranded.** Every exercise app (days 11–23) now reads as a  
  coherent Book Store: brand, page copy, `metadata` titles and OpenGraph tags, the SEO reference doc,  
  and the order line-item data. **159 files** in the first pass, **27** in a second, **11** in a third.
- **Identifiers renamed so the code matches the domain** — `DishList.js` → `BookList.js`,  
  `DishSearch.js` → `BookSearch.js`, `data/dishes.js` → `data/books.js`, `app/api/dishes/` →  
  `app/api/books/`, `dishes`/`dish` → `books`/`book`, `spicy` → `bestseller`, and `app/kitchen/` →  
  `app/dispatch/`. The `/menu` **route path** was deliberately left alone, because the reading sheets  
  refer to "the menu page" throughout.

### 5.2 Defects found while applying the fixes

These were not in the original review and are worth knowing about.

| Finding                                                | Detail                                                                                                                                                                                                                                                                   | Fix                                                                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Day 15 exercise could not build at all**             | `day 15/addis-eats` imports `swr` in three files, but its `package.json` declared only `next`, `react` and `react-dom` → `Module not found: Can't resolve 'swr'`.                                                                                                        | `"swr": "^2.5.1"` added to `dependencies` (the version every other day uses).                                                             |
| **Day 15 exercise had no `@/*` path alias**            | `tsconfig.json` existed but omitted `compilerOptions.paths`, so all nine `@/lib/auth` imports failed → `Module not found: Can't resolve '@/lib/auth'`.                                                                                                                   | `"paths": { "@/*": ["./*"] }` added, matching every other app.                                                                            |
| **Day 15 exercise had duplicate route files**          | `app/layout.js` **and** `app/layout.tsx`; `app/page.js` **and** `app/page.tsx`. Next resolves `.js` before `.tsx`, so the thin scaffold layout was winning over the real one — which means `<Providers>` was never mounted and the cart context was dead on every route. | The two stale `.js` files were set aside so the `.tsx` versions are used.                                                                 |
| **Exercise apps pointed at images that did not exist** | `app/data/books.js` referenced `/books/*.jpg`, but only `public/dishes/{cake,pasta,shiro}.jpg` were ever committed — so every catalogue image 404'd.                                                                                                                     | Nine 300×200 cover images generated into `public/books/` for days 18, 19, 21, 22 and 23; the leftover `public/dishes/` folders set aside. |
| **Order history still named dishes**                   | `app/data/orders.js` in days 21, 22 and 23 listed `Doro Wat`, `Special Kitfo`, `Beef Tibs`, `Shiro Tegabino`, … as line items, which surfaced on the orders dashboard and its charts.                                                                                    | Mapped to book titles from the catalogue. Customer names were left untouched.                                                             |
| **`DATA.md` mislabelled**                              | In days 19, 21, 22 and 23 the file was headed *"… (Day 19)"* although it documents code that ships in those apps.                                                                                                                                                        | Retitled, with a note that it is reference material retained from D44.                                                                    |
| **Price format disagreed with the structured data**    | The per-book `<title>` used a bare `$` while the JSON-LD on the same page said `priceCurrency: "ETB"`.                                                                                                                                                                   | Title now renders `… - 320 ETB`, matching the JSON-LD and the catalogue cards.                                                            |

### 5.3 Day 13 — the measured bundle figures

Both states were built with `next build` (Next.js 16.3.5, Turbopack) and read from the build's own  
`.next/diagnostics/route-bundle-stats.json` (`firstLoadUncompressedJsBytes`).

| Route              |    Before |         After |       Change |
| ------------------ | --------: | ------------: | -----------: |
| `/menu`            | 465,742 B | **464,154 B** | **−1,588 B** |
| `/menu/[id]`       | 454,746 B |     454,350 B |       −396 B |
| `/`                | 462,420 B |     462,420 B |            0 |
| `/cart` (baseline) | 453,552 B |     453,552 B |            0 |

*Before* = `"use client"` at the top of `page.js` and on `layout.js`, with the data fetched in the  
browser through `useState`/`useEffect` and `DishList` dragged onto the client as a consequence.  
*After* = `page.js` is an async Server Component, the directive sits only on `Counter`, `FilterShell`,  
`NavigationButton`, `CartProvider` and `error`, and `DishList` stays on the server.

The drop is real but modest, and the reason is worth stating: about 453 KB of a first visit is the  
framework and React runtime, which every route pays for regardless of the boundary. The change moves  
the slice on top of that baseline from +12,190 B to +10,602 B. The larger win is not in bytes — the  
2-second `await getDishes()` now runs on the server, and `DishList` ships no JavaScript at all.

### 5.4 Updated scoreboard

| Day | Sheet | Exercise                                                | Mini-project                        |
| --- | ----- | ------------------------------------------------------- | ----------------------------------- |
| 11  | D36   | ✅ (home route fixed)                                    | ✅                                   |
| 12  | D37   | ✅                                                       | ✅ (checkout comment added)          |
| 13  | D38   | ✅                                                       | ✅ (bundle figures recorded)         |
| 14  | D39   | ✅                                                       | ✅                                   |
| 15  | D40   | ✅ (build repaired: `swr`, `@/*` alias, duplicate files) | ✅                                   |
| 16  | D41   | ✅ (poll 5000 ms)                                        | ✅                                   |
| 17  | D42   | ✅                                                       | ✅                                   |
| 18  | D43   | ✅                                                       | ✅                                   |
| 19  | D44   | ✅                                                       | ✅                                   |
| 20  | D45   | ✅                                                       | ✅                                   |
| 21  | D46   | ✅                                                       | ✅                                   |
| 22  | D47   | ✅                                                       | ✅ (named time zone; `ETB` currency) |
| 23  | D48   | ✅ (now a distinct, coherent Book Store deliverable)     | ✅                                   |
| 24  | D49   | —                                                       | ✅ (stray `/Home` removed)           |

**Remaining caveat:** the reading-sheet PDFs under days 11–18 are still untracked in git, and  
`day 15/addis-eats` carries a `.kilo/worktrees/` copy from an earlier agent session. Neither affects  
the submitted work, but both are worth cleaning before handing the repository over.
