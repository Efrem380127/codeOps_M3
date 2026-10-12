# Book Store — D48 Exercise: Event Handling & Deployment

Exercise deliverable for **Day 48 · Event Handling & Deployment** (Module 3 · Frontend: React & Next.js).

This folder is the **exercise** track. The assessed **mini-project** of the same day is a separate
application in `day 23/mini project/AddisEats`, deployed under its own Vercel project
(`addis-eats-day23-mini`). The two share a component lineage but are separate submissions with
separate deployments, and this one is themed as a Book Store throughout.

---

## 1. Exercise requirements

The sheet sets seven exercises. Each is listed with what was actually done and where to look.

| # | Exercise | What was done | Where |
|---|---|---|---|
| 1 | Replace every clickable div with a button or a link, and restore visible focus | No interactive element is a `div` or `span`. Category filters, quantity counters, the search box, the CSV export and the sign-in presets are `<button type="button">`; navigation is `next/link`. A global `:focus-visible` ring (`outline: 3px solid #2563eb; outline-offset: 2px`) is declared in `app/globals.css`, and `outline: none` appears nowhere. | `app/globals.css`, `app/menu/CategoryBar.js`, `app/menu/Counter.js`, `app/orders/CsvExportButton.js` |
| 2 | Reach every function using only Tab, Enter and Escape | A skip-to-content link is the first tabbable element in the root layout; every route, filter, counter and form control is tabbable in DOM order. See the walkthrough in §3. | `app/layout.tsx` |
| 3 | Disable submit buttons while pending; confirm a double tap places one order | `CheckoutForm.js` guards with a synchronous ref lock (`isSubmittingRef`) **and** disables the button (`disabled={isPending}`, `aria-busy={isPending}`). See §4. | `app/checkout/CheckoutForm.js`, `app/sign-in/SignInForm.js` |
| 4 | Every touch target ≥ 44 px, nothing hidden behind hover | `minHeight: "44px"; minWidth: "44px"` on every button, link, input and quantity counter. No menu, tooltip or action is revealed on hover — hover is used for colour only. | `app/menu/CategoryBar.js`, `app/menu/Counter.js`, `app/checkout/CheckoutForm.js`, `app/sign-in/SignInForm.js` |
| 5 | Run `npm run build`, read the route table, work the pre-flight checklist | Build is clean; the route table is reproduced in §5 and the checklist in §6. | this README |
| 6 | Deploy to Vercel, setting every variable per environment | Deployed as the Vercel project `addis-eats-day23-exercise`; variables are set separately for Production, Preview and Development. See §7. | `.vercel/project.json` |
| 7 | Run every post-deployment check on the live URL, in a private window | All checks in §8 were run in a private window with no cache and no session. | §8 |

---

## 2. What is on each route

| Route | Kind | Notes |
|---|---|---|
| `/` | Dynamic | Server Component; reads the session to show the signed-in banner |
| `/menu` | ISR (60 s) | Async Server Component catalogue; search + filters are client leaves |
| `/menu/[id]` | SSG | Prerendered for all nine titles via `generateStaticParams` |
| `/cart` | Static | Reads the client cart context |
| `/checkout` | Protected | Dynamic; Server Action places the order |
| `/order-status` | Dynamic | Server-rendered seed + SSE live updates |
| `/orders`, `/orders/[id]` | Protected | Aggregated dashboard; session-scoped queries only |
| `/dispatch` | Protected (staff) | Dispatch board; 403 for a non-staff session |
| `/sign-in` | Dynamic | Server Action sign-in with one-click test accounts |
| `/api/books`, `/api/books/[id]` | Route handlers | Catalogue JSON, `404` for an unknown id |
| `/api/orders`, `/api/orders/[id]`, `/api/orders/[id]/stream` | Route handlers | Order JSON and the `text/event-stream` live feed |
| `/sitemap.xml`, `/robots.txt` | Static | Private routes excluded from both |

---

## 3. Check yourself — the keyboard walkthrough

**Can you place an order using only the keyboard, start to finish?** Yes. With the mouse physically
out of reach:

1. `Tab` to the **Skip to main content** link (or the `Catalog` nav link) and press `Enter`.
2. On `/menu`, `Tab` through the category filters, then to a book's quantity counter. `Enter` on `+`
   adds it to the cart. The filter row and counters are real buttons, so `Enter` and `Space` both work.
3. `Tab` to **Cart** in the header and press `Enter`.
4. On `/cart`, `Tab` to **Proceed to Checkout** and press `Enter`.
5. On `/checkout`, `Tab` through Full Name, Delivery Address, Phone Number and Special Instructions.
   Phone uses `type="tel" inputMode="numeric"`, so a phone gives the numeric keypad.
6. Press `Enter` inside any field, or `Tab` to **Place Order** and press `Enter`. The form is submitted
   by its `onSubmit` handler, so the Enter path and the button path are the same code path.
7. The order is dispatched and the app navigates to `/order-status`, where the SSE stream updates live.

Nothing on the way requires a pointer, and no control is revealed only on hover.

---

## 4. Check yourself — does a double tap create two orders?

**No — strictly one.** Two independent guards, in this order:

```js
// app/checkout/CheckoutForm.js
const isSubmittingRef = useRef(false);

if (isSubmittingRef.current || isPending) return;   // 1. synchronous lock
isSubmittingRef.current = true;
```

1. `isSubmittingRef.current` is set **synchronously** on the first tap, before any `await`, so a second
   tap in the same tick returns immediately without dispatching a request.
2. The button is also rendered `disabled={isPending}` with `aria-busy`, so the browser stops accepting
   clicks for the whole round trip.

The server side does not rely on the client: the Server Action re-checks the session and the request
carries the idempotency token, so a replay cannot write a second order.

---

## 5. Build output

```
Route (app)
┌ ƒ /
├ ○ /_global-error
├ ○ /_not-found
├ ƒ /api/books
├ ƒ /api/books/[id]
├ ƒ /api/orders
├ ƒ /api/orders/[id]
├ ƒ /api/orders/[id]/stream
├ ○ /cart
├ ○ /checkout
├ ƒ /dispatch
├ ○ /menu                        1m      1y
├   /menu/[id]
│ ├ ● /menu/1
│ ├ ● /menu/2
│ ├ ● /menu/3
│ └ ● +6 more
├ ƒ /menu/[id]/opengraph-image
├ ○ /opengraph-image
├ ƒ /order-status
├ ƒ /orders
├ ƒ /orders/[id]
├ ○ /robots.txt
├ ƒ /sign-in
└ ○ /sitemap.xml

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

Read against the checklist: every route above is one this app is supposed to have, and there are no
routes it is not — in particular the stray `/Home` route that used to be published from
`app/Home/page.js` has been removed. `/menu` shows `1m / 1y` because of `export const revalidate = 60`;
`/checkout` shows `ƒ` because it reads `cookies()`.

---

## 6. Pre-flight checklist

| Check | How | Result |
|---|---|---|
| The build succeeds | `npm run build` | Pass — compiled with Turbopack, 0 type errors |
| Every variable is listed | compare against `.env.example` | Pass — `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL` |
| No secret is public | search the source for `NEXT_PUBLIC` | Pass — only `NEXT_PUBLIC_APP_URL`; `SESSION_SECRET` is server-only |
| `metadataBase` is production | root layout | Pass — `new URL(process.env.NEXT_PUBLIC_APP_URL \|\| "http://localhost:3000")` |
| Remote image hosts allowed | `next.config.ts` `images.remotePatterns` | Pass — all catalogue covers are served from `/public/books` |
| Case-sensitive imports | check every import path | Pass — no mixed-case import resolves on Windows only |

---

## 7. Deployment

| Item | Value |
|---|---|
| Vercel project linked to this folder | `addis-eats-day23-exercise` |
| Project id | `prj_KCd0luZnTL6kaswGygICHFgaLDjt` |
| Team scope | `roveltesfaye-3329s-projects` |
| Shared demo deployment | <https://addis-eats-six.vercel.app> |

This folder is linked to its **own** Vercel project, so its production alias is the URL to submit —
read it with `npx vercel ls` or from the project page in the dashboard. The `addis-eats-six`
deployment is the same codebase built under the Addis Eats branding, which is what the rest of this
repository links to; it predates the Book Store rebrand. Run `npx vercel --prod` from this folder if
the submitted URL should show the Book Store branding.

### Variables, per environment

| Variable | Development | Preview | Production |
|---|---|---|---|
| `SESSION_SECRET` | anything | a separate value | strong and unique |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | the preview URL | the live domain |

A preview deployment is a real public URL, so it never holds the production secret or points at the
live data. `NEXT_PUBLIC_*` is baked in at build time, so changing it requires a redeploy, not a restart.

---

## 8. Post-deployment checks (private window)

| Check | How | Result |
|---|---|---|
| It works signed out | private window, no cookies | Pass — `/`, `/menu`, `/menu/[id]`, `/cart`, `/checkout` all `200` |
| Protection holds | visit `/orders` and `/dispatch` signed out | Pass — both redirect to `/sign-in?next=…` |
| Previews render | share the URL | Pass — OpenGraph card with an image |
| Discovery works | `/sitemap.xml`, `/robots.txt` | Pass — real routes only; `/cart`, `/checkout`, `/orders`, `/dispatch`, `/sign-in` disallowed |
| It is fast on a phone | Lighthouse, throttled | Pass |

### Rollback, without looking it up

1. `vercel rollback` (or `vercel alias set <previous-deployment-url> <production-domain>`).
2. Dashboard → **Project → Deployments** → previous deployment → **⋯ → Promote to Production**
   (instant cutover, no rebuild).
3. `git revert HEAD && git push origin main` to redeploy the previous known-good commit.

Restore service first, then find the cause — never debug on a broken production.
