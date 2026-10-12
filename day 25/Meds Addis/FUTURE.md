# FUTURE.md — Triage, Deferred Work & Roadmap

Meds Addis · IBT College Canada CodeOps · Full Stack · Module 3 Frontend Capstone

The reading sheet asks for a project that visibly improved after assessment, and
for the things left out to be *named* rather than silently missing. This document
is that record: what was in scope, what was cut and why, and what each cut would
cost to put back.

---

## 1. MoSCoW triage

### Must — the application is incomplete without these

| Item | State |
|---|---|
| Browse the catalogue with search, category filter and paging | ✅ shipped |
| Add to cart, adjust quantity, see the running total | ✅ shipped |
| Checkout with server-side validation and per-field errors | ✅ shipped |
| **Prescription gate** — a prescription-only line cannot be ordered without an approved prescription | ✅ shipped |
| **Pharmacist review queue** — approve or reject, with a mandatory reason on rejection | ✅ shipped |
| Three-layer authentication with a signed, `httpOnly` session cookie | ✅ shipped |
| All three attacks refused, with the refusing line identifiable | ✅ shipped |
| Role separation: customer / pharmacist / manager | ✅ shipped |
| Order tracking with a live courier stream | ✅ shipped |
| Loading, empty and error states on every list and every async surface | ✅ shipped |
| Zero clickable divs, full keyboard reach, 44 px touch targets | ✅ shipped |
| Clean production build, deployed, with a live URL | ✅ shipped |

### Should — visibly missing, application still works

| Item | State | Note |
|---|---|---|
| Manager dashboard with revenue and volume charts | ✅ shipped | Recharts, with accessible table mirrors |
| CSV export of orders and stock | ✅ shipped | RFC 4180, UTF-8 BOM for Excel |
| Stock reorder alerts | ✅ shipped | At or below 10 units |
| Debounced live search | ✅ shipped | 300 ms |
| `sitemap.xml` / `robots.txt` / OpenGraph card | ✅ shipped | Private routes disallowed |
| Sortable dashboard table with `aria-sort` | ✅ shipped | URL-driven |
| Prescription history per patient, with review notes | ✅ shipped | |

### Could — consciously cut to protect the deadline

| Item | Why it was cut |
|---|---|
| **Payment (Telebirr, CBE Birr, Stripe)** | A real gateway needs merchant approval and an external sandbox, neither of which is available in the session. Cash-on-delivery lets the full ordering lifecycle complete end to end, which is what the rubric actually measures. The order model already carries the shape a payment record would attach to. |
| **Real document storage for prescriptions** | The build records the attachment *file name* and says so plainly in the UI. Object storage is a backend concern and arrives with Module 4. Pretending a scan had been uploaded would be the dishonest option. |
| **Per-user password salts and an adaptive hash** | SHA-256 without a salt is not suitable for real credentials. It is called out in [AUTH.md](AUTH.md) rather than glossed over. |
| **Bidirectional WebSockets** | SSE plus 5-second polling covers the requirement at a fraction of the operational cost, and neither needs a library. A standing socket on serverless infrastructure is billed per second whether or not anyone is watching. |
| **Amharic / English switcher** | Culturally the right feature for an Addis pharmacy, and the largest single piece of work on this list — it means locale-prefixed routes and a translation layer, which would duplicate route testing without adding architectural breadth. |
| **Push or SMS notification on dispatch** | Needs a provider and a phone number registry. The order status page and the live stream cover the same information while the tab is open. |
| **A separate courier application** | Out of scope for a frontend module; the courier position is modelled and streamed, which is the part the rubric asks about. |
| **Dark mode** | Straightforward with the existing token layer, and worth nothing on the rubric. |
| **Drug-interaction checking** | Genuinely valuable and genuinely dangerous to fake. It needs a real pharmacological dataset and a licensed pharmacist's sign-off, not a frontend build. |

---

## 2. Known limitations, stated plainly

These are not cuts — they are things a reviewer should know before trusting the
application further than it deserves.

1. **The data is fixtures, not a database.** Every write lives in a module-scope
   array and is lost when the server process restarts. On a serverless platform
   that means an order placed by one instance may not be visible to the next.
   This is the single largest gap and it is exactly what Module 4 closes.

2. **Passwords are unsalted SHA-256.** Adequate to demonstrate the flow,
   inadequate for real credentials. `lib/auth.js` is the only file that changes.

3. **The prescription attachment is a file name.** No bytes are stored and no
   scan is actually reviewed. The review *workflow* is real; the document is not.

4. **The courier movement is simulated.** The SSE endpoint nudges a coordinate
   toward the delivery address on each tick. The wire format is what a real GPS
   ping would use, so only the producer changes in Module 4.

5. **There is no rate limiting.** Sign-in can be attempted as fast as the network
   allows. A production pharmacy needs both rate limiting and account lockout.

6. **No audit log.** The prescription review records who decided and when on the
   record itself, but there is no append-only trail. Regulated dispensing needs
   one.

7. **`middleware` is deprecated in favour of `proxy` in Next 16.** The build
   prints a warning for every run. The migration is a rename plus a codemod, and
   is deliberately left until after assessment — changing routing internals on
   presentation day is how a working application stops working.

---

## 3. Roadmap

### Module 4 — the backend track (immediate)

The frontend is already shaped for this. `app/data/*` and `lib/*.js` are the only
modules that touch fixtures, and they are deliberately shaped like an API
response. Replacing them with fetches against a Nest/Go/.NET API should not
require a component to change.

1. **Real persistence.** Users, medicines, orders and prescriptions in a
   database, behind the API.
2. **Object storage for prescriptions.** Upload the scan, store the key, serve it
   through a signed URL. The `fileName` field becomes `storageKey`.
3. **Server-issued sessions.** Move from a stateless signed cookie to a session
   table with revocation, so a stolen cookie can be killed.
4. **Rate limiting and lockout** on `/api/auth/sign-in`.
5. **An append-only audit log** for every dispensing decision.

### Module 5 — data and infrastructure

6. **Real inventory.** Stock decremented on order creation inside a transaction,
   with a reservation window so two customers cannot buy the last pack.
7. **Expiry and batch tracking.** A pharmacy cannot dispense without batch
   numbers and expiry dates, and both need to reach the invoice.
8. **Payments.** Telebirr and CBE Birr first — they are how people actually pay
   in Addis — with Stripe behind the same interface for cards.
9. **Testing and CI.** Unit tests on `lib/orders.js` (the money derivation is the
   highest-risk pure logic in the application), an integration test per API
   route, and a Playwright pass over the main flow.
10. **Observability.** Structured logs, error reporting, and an alert when the
    dispensary queue grows beyond a threshold.

### Beyond

11. **Amharic localisation**, with `next-intl` and locale-prefixed routes.
12. **Drug-interaction warnings** — only with a licensed dataset and pharmacist
    sign-off.
13. **Refill reminders** for chronic prescriptions, which is where a pharmacy
    delivery service earns repeat custom.
14. **A courier application** with real GPS, which is what the SSE endpoint is
    already shaped to receive.

---

## 4. What another week would change, in priority order

If one more week were available and the assessment were not imminent:

1. **Persist to a real store.** Everything else is decoration until an order
   survives a restart.
2. **Salt and slow the password hash.** It is an hour's work and it removes the
   most serious security caveat in the project.
3. **Store the prescription scan.** The workflow is already built around it; only
   the bytes are missing.
4. **Add tests around the money.** `orderLines`, `orderTotals` and
   `hydrateOrder` are pure functions with real consequences, and they are the
   cheapest thing in the codebase to test properly.
5. **Rate-limit sign-in.** Small, and it closes the most obvious gap a reviewer
   will find.

---

## 5. What was deliberately *not* cut

Worth recording, because these are the things that most often get dropped when
time runs short and they are the ones the rubric weights most heavily:

- **The empty states.** Every list has one, and the prescription panel explains
  what happens next rather than showing a blank.
- **The three documents.** README, AUTH, DATA, PERF — written while the decisions
  were fresh, not reconstructed afterwards.
- **The accessible table behind every chart.** A chart alone is not a data
  visualisation for everyone.
- **The refusing line for each attack.** Being able to point at the line that
  stopped an attack is the difference between a demonstration and a defence.
- **Honest documentation.** Where the application is weak, this file and the
  others say so. A reviewer who finds a limitation you named reads it as
  judgement; one who finds a limitation you hid reads it as an oversight.
