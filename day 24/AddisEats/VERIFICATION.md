# VERIFICATION.md: Testing, Verification & Presentation Walkthrough

This document records the exact steps to verify Addis Eats across the four areas
using browser tools, network inspection, security attacks, and the 8-minute
presentation walkthrough script.

> **Current status:** Sections 1 to 4 record what was actually observed on the
> deployed build at `https://addis-eats-capstone.vercel.app`. Section 5 is the
> review policy, not a claim that the demo results prove general safety.

---

## 1. Verifying the Protection: The Console Attacks

Open the browser DevTools Console on the deployed application
(`https://addis-eats-capstone.vercel.app`) or localhost. Sign in first for
Attacks 2 and 3; Attack 1 must be run signed out.

```js
// Attack 1: Calling a Server Action While Signed Out
await cancelOrder("ord_812");
// Expectation: Refused, not a crash.
// Stopped by: app/actions/order.js:113
// Returns: { error: "Unauthorized: No active session" }

// Attack 2: Calling a Server Action as Another Account (IDOR / Ownership Bypass)
// Signed in as user "Chala Kebede" (id: usr_chala_kebede)
await cancelOrder("1"); // Targeting Order #1 belonging to "usr_abebe_bikila"
// Expectation: Refused on ownership, not on session.
// Stopped by: app/actions/order.js:122
// Returns: { error: "Forbidden: Not the record owner" }

// Attack 3: Open Redirect via Crafted Sign-in Link
// Navigating to: /sign-in?next=https://example.com or /sign-in?next=//example.com
// Expectation: Lands on /, not on example.com.
// Stopped by: app/actions/auth.js:27
// Sanitized target defaults safely to "/"
```

### The API is guarded too

The same ownership rule is enforced on the JSON route, not only in the actions.
Signed out, on the deployed URL:

```
GET /api/orders/1   ->  401  {"error":"Unauthorized"}
GET /api/orders     ->  401  {"error":"Unauthorized"}
GET /api/dishes     ->  200  (the catalogue is public by design)
```

Signed in as another account, the same route answers `403 Forbidden`. The
customer's phone number and delivery area are never returned to a caller who is
not the owner.

### URL ID Tampering Test
- Change the URL from `/orders/1` to `/orders/2` (an order belonging to another customer).
- **Result**: `app/orders/[id]/page.js` at line 16 refuses the render when
  `order.sessionId` does not match `session.id` and the caller is not staff, and
  shows an `Access Denied` panel instead. The order details are never rendered.

---

## 2. Verifying the Rest: Tool-Based Audit

| Area | How to Check | What You Want to See | Actual Verification Result |
|---|---|---|---|
| **Live data** | Network tab while typing in search box | One request per pause, not per keystroke | **Passed**: the 300ms debounce timer resets on each key, so only one `GET /api/dishes?search=...` fires after typing stops. An empty box sets the SWR key to `null` and fires nothing at all. |
| **Seeding** | Load `/order-status?id=1` | Data on arrival, no spinner at all | **Passed**: the server awaits the order and passes it to SWR as `fallbackData`, so the status is on screen at first paint. Polling then continues every 3 seconds. |
| **Performance** | Run the CWV script on the deployed build | Both numbers recorded | **Measured, target missed**: LCP 4.0s desktop and 8.5s mobile under Slow 4G and 4x CPU, against a 2.5s target. CLS 0.02 mobile and 0.001 desktop, inside the 0.1 budget. Full method in [PERF.md](PERF.md). |
| **Metadata** | View page source (`Ctrl+U`) on deployed page | Absolute `og:image` URLs, distinct descriptions | **Passed**: `<meta property="og:image" content="https://addis-eats-capstone.vercel.app/menu/1/opengraph-image">`. Each dish has a unique description. |
| **Discovery** | Open `/sitemap.xml` and `/robots.txt` in browser | Real dishes listed, private routes absent | **Passed**: `/sitemap.xml` lists all 9 dishes (`/menu/1` to `/menu/9`). `/robots.txt` disallows `/cart`, `/checkout`, `/orders`, `/kitchen` and `/sign-in`. |
| **Cart and checkout** | Add two dishes, edit quantities, place an order | Totals match, order carries its lines | **Passed**: the cart persists per tab, totals recompute on quantity change and removal, and the confirmation lists each line with a correct order total. |

---

## 3. 8-Minute Presentation Walkthrough Script

| Time | Segment | What to Demonstrate & Say |
|---|---|---|
| **0-1 min** | **The Deployed Application** | Open `https://addis-eats-capstone.vercel.app`. Sign in with a username only (for example `Abebe Bikila`) and the customer role. Browse the menu, add Doro Wat and Shiro to the cart, and place an order on `/checkout`. Show that the confirmation lists the dishes and a correct total. |
| **1-3 min** | **The AUTH.md Table & 3 Attacks** | Open `AUTH.md`. Explain who may see what and why the fourth column matters. Open the DevTools console and run the three attacks: signed-out cancel, cross-account cancel, open redirect. Show that each is refused, and point at the exact line of code. |
| **3-5 min** | **Live Data & Seeded Orders** | Open the Network tab, filtered to Fetch/XHR. Type "Tibs" rapidly and point out that no request fires until typing stops (300ms debounce). Then open `/order-status?id=1` and show that the full order renders on first paint with no spinner, because the server seeded SWR through `fallbackData`. Point out the subsequent 3-second polls. |
| **5-7 min** | **PERF.md: The Budget** | Open `PERF.md`. Walk the measured column and be straight about what is missed: LCP is 4.0s desktop and 8.5s mobile against a 2.5s target, because the hero source PNG is 1.9 MB. Then show what does pass: CLS at 0.02 through explicit dimensions and `next/font` metric overrides. |
| **7-8 min** | **Discovery Previews & Q&A** | Paste a dish link (`/menu/1`) into an OpenGraph debugger or social simulator (or view source). Show the dynamic dish card with dish title, ETB price, and description. Open `/sitemap.xml` and `/robots.txt` to prove private routes are excluded. Conclude and take questions. |

---

## 4. Review Questions Answered

1. **For one private route in your build, what does each of the three layers actually prove?**  
   For `/orders`:
   - *Middleware* (`proxy.js`): proves a valid session cookie exists and redirects anonymous visitors before rendering.
   - *Server Component*: proves the session is valid at render time and keeps only the order rows whose `sessionId` matches `session.id`, so another account's records never enter the render.
   - *Server Action*: proves the caller owns the specific record before mutating state (`order.sessionId === session.id`).
2. **Which query in your application runs on the client, and why can it not run on the server?**  
   Menu search (`/api/dishes?search=...`). It cannot run solely on the server because it is triggered by typing in real time. It is debounced on the client by 300ms, and the key is `null` when the box is empty.
3. **What were your LCP numbers, and which change did most of it?**  
   Measured on the current deployment with `PerformanceObserver` under mobile Slow 4G and 4x CPU throttling, LCP is **8.5s on mobile** and **4.0s on desktop**, against a 2.5s target. `priority` is on the hero image, which starts the download early, but it is not yet enough: the hero source PNG is 1.9 MB, so the mobile request has too much to move. Re-exporting that image at roughly 1600 px in a modern format is the next single change. See [PERF.md](PERF.md).
4. **Show the line that refuses an action called with another account's id.**  
   `app/actions/order.js:122`:
   ```js
   if (order.sessionId !== session.id && order.owner !== session.name && session.role !== "staff") {
     return { error: "Forbidden: Not the record owner" };
   }
   ```
5. **Why must the performance baseline be taken after the features are finished?**  
   Because a baseline taken on an unfinished scaffold measures an artificial, incomplete application. A real measurement has to reflect the fonts, images, layouts, session reads and data queries the finished product actually ships.
6. **What is still missing from this capstone, and when will it be done?**  
   The measured work still outstanding is the hero asset re-export and the client bundle, both described in [PERF.md](PERF.md). On the product side, payment remains a demo: the checkout records an order but processes no money. Real authentication is also outstanding, and is described as a risk in the register below.

---

## 5. Code Review Standard and Process

**Scope:** All changes under `day 24/AddisEats/` in the `codeOps_M3` monorepo.
This is a review policy, not proof that the demo results above hold for changed
code. Review the diff *and* its call sites; a green build is not a substitute for
behavioural or security evidence.

### A. Required standards (review every change against applicable items)

| Area | Acceptance criteria / evidence |
|---|---|
| Correctness and clarity | Describe expected behaviour and edge cases; keep changes focused; use descriptive names; remove dead code and debug output. Match the surrounding JS/TS and React conventions rather than introducing a competing style. Explain non-obvious decisions, not obvious syntax. |
| Tests and regressions | Add or update automated tests for changed nontrivial behaviour where feasible, including negative and boundary cases. There is **no test runner or suite** in this project, so record reproducible manual steps until one is adopted; a checklist is not a substitute for coverage. Record any untested case as a follow-up with an owner. |
| Trust boundaries | Treat URL params, request bodies, form data, cookies and client state as untrusted. Enforce identity, role, record ownership and validation again in every server action and API handler; never rely on middleware, hidden controls, or user-submitted IDs alone. Do not log secrets or expose customer names, phone numbers or addresses on public endpoints. |
| Next.js architecture and data | Keep server components by default; justify each new `"use client"` boundary. Check the cache policy, private-data isolation, SWR key/seed behaviour, polling and debounce against `BOUNDARY.md`, `DATA.md` and `DECISIONS.md`. Avoid module-global mutable state for production data and unbounded network requests. |
| UX, accessibility and discovery | Check loading, empty and error states, keyboard interaction, labels, focus and readable text. For public pages check metadata and canonical/OG links; keep private customer routes out of the sitemap. |
| Performance and docs | Check image dimensions and size, client bundle growth, and the affected Core Web Vitals against `PERF.md` and `DECISIONS.md`. Update `AUTH.md`, `DATA.md`, `BOUNDARY.md` and this file when their claims change; never repeat a measured score without re-running the measurement. |
| Tooling | Run `npx eslint app lib --max-warnings=0` and `npm run build` from this project directory; report pass/fail, warnings and environment limits. Next.js 16 removed `next lint`, so lint is invoked through `eslint` directly. TypeScript has `allowJs: true` but **not** `checkJs`, so a passing type check does not validate the `.js` files. |

### B. Severity and disposition

- **Blocker (P0):** Exploitable privilege escalation, private-data exposure, secret leakage, or destructive behaviour. Stop release; notify the maintainer immediately.
- **Must fix (P1):** Incorrect user-visible behaviour, missing ownership or role checks, a significant regression, a failing check or build, missing evidence for a high-risk change, or a new lint warning. Fix before merge, then request re-review.
- **Should fix (P2):** Maintainability, accessibility, test or performance gaps with a bounded impact. Fix before merge unless reviewer and owner agree to a tracked issue with an owner and a due date.
- **Suggestion (P3):** Optional naming or style preference. Do not block. Use `P0` to `P3` labels in review comments with file and line, why it matters, and a concrete recommendation.

### C. Pull request workflow (manual until CI and branch rules exist)

1. **Author, before requesting review:** create a focused branch; explain intent, changed routes and data boundaries, risks, rollback plan and linked issue. Keep unrelated refactors separate. Run `npx eslint app lib --max-warnings=0` and `npm run build`; record the exact outcomes. For UI changes attach before/after screenshots and keyboard and mobile checks; for behaviour changes attach reproduction steps and actual results. Update the relevant architecture docs.
2. **Triage and assign:** assign one independent reviewer for normal PRs; assign **two**, including someone familiar with security, for auth, session, order or customer data, API authorization, secrets, dependencies or deployment configuration. An author cannot approve their own PR.
3. **Reviewer, in order:** read the intent and risk, trace entry points through data access and mutations, run or check the evidence for the affected paths, then check correctness, privacy, tests, accessibility, performance and maintainability. For auth and order paths, try signed-out access, customer A versus customer B access, staff-only access, invalid input and a forged ID, using demo data only.
4. **Iteration and merge:** the author addresses all P0 and P1 comments and requests re-review after substantive changes. Merge only after the required independent approvals, all blocking threads resolved, and lint and build passing on the final commit. Use squash merge, retain the PR evidence, and watch the affected routes after deployment.
5. **Urgent hotfix:** still require an independent reviewer and focused verification before merge. If normal review cannot happen, do not represent the change as reviewed; coordinate with the maintainer and document the exception and the follow-up review.
6. **Operating cadence:** request a first review response by the next business day; if no reviewer is available, the maintainer reassigns rather than self-approving. Each week review open P0 and P1 findings and overdue P2 exceptions.

**PR description template (copy into each Addis Eats PR):**

```md
## What and why
- Issue / goal:
- Scope and affected routes/data:
- Risk and rollback:

## Verification (attach evidence and exact outcome)
- [ ] `npx eslint app lib --max-warnings=0`: result and warnings:
- [ ] `npm run build`: result:
- [ ] Automated tests added/updated, or why not yet feasible:
- [ ] Manual happy-path, error/empty and boundary checks: steps and results:
- [ ] Auth/role/ownership and customer-data checks (if applicable):
- [ ] UI keyboard/mobile/screenshots or performance/SEO checks (if applicable):
- [ ] Architecture/documentation updated, or not applicable:

## Review
- Review risk: normal / high (reason):
- Reviewer(s) and unresolved P0/P1 findings:
- P2 exceptions with linked issue, owner and due date:
```

### D. Adoption notes and open risk register

At adoption, the repository has no automated test files, no installed GitHub PR
template, no CI workflow, and no proven required branch rule for this project.
The repo root is `codeOps_M3`, **not** this app directory, so a future GitHub
workflow or shared PR template must be installed at the repo-root `.github/` and
scoped to this project's path. A maintainer must configure protected `main`,
required approvals, stale-approval dismissal and required status checks in the
hosting service; this document alone cannot enforce them.

**Open findings to track separately; this policy does not fix them:**

- **P0 for production:** `app/actions/auth.js` accepts the submitted `role`,
  including `staff`, and issues a signed session without any trusted identity
  check. `lib/auth.js` also falls back to a shared signing secret when
  `SESSION_SECRET` is unset. Demo-only login must not be treated as real
  authentication. Restrict or remove public access until it is replaced and
  independently verified.
- **P2 tooling debt:** there is no test runner, and type checking does not cover
  the `.js` files. Lint is currently clean under
  `npx eslint app lib --max-warnings=0`; keep it that way rather than tolerating
  new warnings.

Re-run this audit after remediation and correct any claim in `AUTH.md`,
`DATA.md`, `README.md` or the historical sections of this file that no longer
matches the code.
