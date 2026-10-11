# Addis Eats - Mini-Project: Harden, Then Ship

## Live Production URL

**Deliverable URL**: [https://addis-eats-six.vercel.app](https://addis-eats-six.vercel.app)

Deployment Inspector: [https://vercel.com/roveltesfaye-3329s-projects/addis-eats](https://vercel.com/roveltesfaye-3329s-projects/addis-eats)

---

## Requirements Verification Matrix

| Requirement | Implementation Details | Verified Status |
|---|---|:---:|
| **No clickable divs** | Every interactive element across the application is either a semantic `<button type="button">` or Next.js `<Link>`. Non-semantic `cursor: pointer` wrappers and raw div click handlers were completely removed. | PASS |
| **Visible focus everywhere** | Universal `:focus-visible` styling (`outline: 3px solid #2563eb; outline-offset: 2px`) is applied globally in `app/globals.css`. A keyboard skip-to-content link is rendered at the top of the root layout. Every page and action is reachable via Tab alone. | PASS |
| **Forms handled with onSubmit** | Checkout and Sign-In forms use standard `onSubmit={handleSubmit}`. Submit buttons are explicitly disabled (`disabled={isPending}`, `aria-busy={isPending}`) while async requests are in flight. | PASS |
| **Double-submit protection** | Synchronous `isSubmittingRef` lock guard combined with `disabled={isPending}` guarantees that rapid double taps or clicks dispatch strictly one order. | PASS |
| **Touch targets >= 44px** | All buttons, links, search bars, quantity counters (`+` / `-`), category filters, and form inputs meet WCAG 2.5.5 / 2.5.8 minimum target sizing (`min-height: 44px; min-width: 44px;`). Nothing is hidden behind hover states. | PASS |
| **Clean `npm run build`** | Compiles with Turbopack and TypeScript with 0 errors across all 26 static (`○`), SSG (`●`), and dynamic (`ƒ`) routes. | PASS |
| **Environment variables per environment** | Configured separately in Vercel for Production, Preview, and Development (`SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`). Server secrets are never leaked to client bundles. | PASS |
| **Post-deployment check** | Tested on live URL in private browser window with clean cache and no session cookies. All core routes return `200 OK`. | PASS |

---

## Check Yourself QA

### 1. Can you place an order using only the keyboard, start to finish?
**Yes.**
1. Tab to **Skip to main content** or top navigation link **Menu** and press `Enter`.
2. On `/menu`, Tab through category filters and dish cards. Focus any dish or quantity counter (`+`) and press `Enter` to increment items in the cart.
3. Tab to the **Cart** link in the navigation header and press `Enter` to open `/cart`.
4. On `/cart`, Tab to **Proceed to Checkout** and press `Enter` to open `/checkout`.
5. On `/checkout`, Tab through each required field:
   - Full Name
   - Delivery Address
   - Phone Number
   - Special Instructions (optional)
6. Tab to the **Place Order** button and press `Enter` (or press `Enter` inside any text input field to submit the form).
7. The order dispatches and automatically navigates to `/order-status` where live tracking and status updates display.

### 2. Does a rapid double tap on Place order create one order or two?
**Strictly one order.**
- `CheckoutForm.js` maintains a synchronous ref lock:
  ```javascript
  const isSubmittingRef = useRef(false);
  // ...
  if (isSubmittingRef.current || isPending) return;
  isSubmittingRef.current = true;
  ```
- Additionally, the submit button is immediately disabled (`disabled={isPending}`).
- Because `isSubmittingRef.current` is set synchronously on the first tap, any subsequent microsecond or millisecond double tap returns immediately before dispatching another request.

### 3. Does the application work in a private window with no session?
**Yes.**
- The public experience (`/`, `/menu`, `/menu/[id]`, `/cart`, `/checkout`) works without authentication or existing cookies.
- Guest orders generate an anonymous session identifier and redirect directly to `/order-status`.
- Authenticated-only dashboards (`/kitchen`, `/orders`) require signing in via `/sign-in` (which provides one-click test accounts for Manager, Chef, and Courier).

### 4. Is any secret visible in the JavaScript the browser downloads?
**No.**
- Only variables prefixed with `NEXT_PUBLIC_` (`NEXT_PUBLIC_APP_URL`) are bundled into client-facing bundles.
- `SESSION_SECRET` is strictly read on the server side in Server Actions and Next.js route handlers (`app/actions/auth.js`, `lib/auth.js`).
- Inspection of client chunks downloaded by the browser confirms zero exposure of server secrets.

### 5. Does a shared link from the live URL render as a card?
**Yes.**
- The application implements OpenGraph card images and meta tags via:
  - `app/opengraph-image.js` (Root social card)
  - `app/menu/[id]/opengraph-image.js` (Dynamic per-dish preview card)
- Includes standard OpenGraph protocol tags (`og:title`, `og:description`, `og:image`, `og:type`) and Twitter card tags (`twitter:card`, `twitter:image`).
- Sharing `https://addis-eats-six.vercel.app` or any menu link generates rich preview unfurls on Slack, WhatsApp, Twitter, and LinkedIn.

### 6. Do you know how to roll back, without looking it up?
**Yes.**
Three primary instant rollback mechanisms are available:
1. **Vercel CLI Instant Alias Pointing**:
   ```bash
   vercel alias set <previous-healthy-deployment-url> addis-eats-six.vercel.app
   ```
   Or:
   ```bash
   vercel rollback
   ```
2. **Vercel Web Dashboard**:
   Go to **Project -> Deployments**, find the previous deployment, click the three dots (`...`), and select **Promote to Production**. Instant traffic cutover takes under 1 second without rebuilding.
3. **Git Revert**:
   ```bash
   git revert HEAD
   git push origin main
   ```
   Triggers an automated production deployment of the previous known-good commit.

---

## Route Architecture & Pre-Flight Table

```
Route (app)                     Revalidate  Expire
┌ ƒ /                           -           -        (Dynamic)
├ ○ /_not-found                 -           -        (Static)
├ ƒ /api/dishes                 -           -        (Dynamic API)
├ ƒ /api/dishes/[id]            -           -        (Dynamic API)
├ ƒ /api/orders                 -           -        (Dynamic API)
├ ƒ /api/orders/[id]            -           -        (Dynamic API)
├ ƒ /api/orders/[id]/stream     -           -        (SSE Live Stream)
├ ○ /cart                       -           -        (Static)
├ ○ /checkout                   -           -        (Static)
├ ○ /Home                       -           -        (Static)
├ ƒ /kitchen                    -           -        (Protected Dynamic)
├ ○ /menu                       1m          1y       (ISR Cached)
├   /menu/[id]                  -           -        (SSG Prerendered)
│ ├ ● /menu/1
│ ├ ● /menu/2
│ ├ ● /menu/3
│ └ ● [+6 more dishes]
├ ƒ /menu/[id]/opengraph-image  -           -        (Dynamic Image)
├ ○ /opengraph-image            -           -        (Static Image)
├ ƒ /order-status               -           -        (Dynamic)
├ ƒ /orders                     -           -        (Protected Dynamic)
├ ƒ /orders/[id]                -           -        (Protected Dynamic)
├ ○ /robots.txt                 -           -        (Static)
├ ƒ /sign-in                    -           -        (Dynamic)
└ ○ /sitemap.xml                -           -        (Static)
```

---

## Environment Variables Configuration

| Variable | Scope | Environment Targets | Purpose |
|---|---|---|---|
| `SESSION_SECRET` | Server-only (Secret) | Production, Preview, Development | Signs and encrypts user session cookies using HMAC SHA-256 |
| `NEXT_PUBLIC_APP_URL` | Client & Server | Production, Preview, Development | Canonical base URL for OpenGraph metadata and API resolution |
