# Addis Eats: Frontend Capstone Project

**IBT College Canada · CodeOps · Full Stack Software Development**  
**Module 3 · Frontend: React & Next.js · Day 49 (Day 24) Capstone Build**  

---

## Live Production Deliverable

- **Live Production URL**: [https://addis-eats-capstone.vercel.app](https://addis-eats-capstone.vercel.app)
- **Vercel Project Dashboard**: [https://vercel.com/roveltesfaye-3329s-projects/addis-eats-capstone](https://vercel.com/roveltesfaye-3329s-projects/addis-eats-capstone)

---

## 1. What It Is and Who It Is For

**Addis Eats** is a full-stack restaurant delivery application tailored for authentic Ethiopian cuisine in Addis Ababa. It connects hungry diners with fresh, local culinary specialties (such as Shiro, Doro Wat, and Kitfo), while providing couriers and restaurant managers with real-time operational oversight.

The application synthesizes the full curriculum of React and Next.js:
- **Semantic, Accessible Markup**: Zero clickable divs, full keyboard navigation (Tab/Enter/Escape), and WCAG 44 px touch targets.
- **Three-Layer Security**: Cryptographic session cookies, edge middleware route protection, server component authorization, and ownership-gated server actions.
- **Live Data Architecture**: Real-time hand-rolled SVG delivery map, Server-Sent Events (SSE) driver stream, 3-second SWR order status polling, and 300ms debounced catalog search.
- **Measured Core Web Vitals**: CLS 0.02 (passes the 0.1 budget) through explicit image dimensions and self-hosted typography (`next/font`). LCP is 4.0s desktop and 8.5s mobile against a 2.5s target, and the hero asset is the reason; see [PERF.md](PERF.md).
- **Data Presentation**: RFC 4180 CSV export, interactive order analytics charts, and tabular accessibility mirrors.

---

## 2. Setup from a Fresh Clone

To run the application locally from a clean git clone:

```bash
# 1. Clone the repository
git clone https://github.com/Riter-Rob/codeOps_M3.git
cd "codeOps_M3/day 24/AddisEats"

# 2. Install dependencies
npm install

# 3. Create local environment file
cp .env.example .env.local

# 4. Start local development server
npm run dev

# 5. Production build & run pre-flight
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 3. Environment Variables Configuration

| Variable | Scope | Environments | Purpose |
|---|---|---|---|
| `SESSION_SECRET` | Server-only (Secret) | Production, Preview, Development | Secret key used to cryptographically sign session cookies (HMAC SHA-256). Concealed from client bundles. |
| `NEXT_PUBLIC_APP_URL` | Client & Server (Public) | Production, Preview, Development | Base domain URL used for OpenGraph cards, canonical tags, and metadata resolution. |

---

## 4. Verification Battery Results

### A. Security: The Three Attacks Refused on the Live URL
1. **Attack 1 (Calling action while signed out)**:  
   `await cancelOrder("ord_812");` -> Refused with `{ error: "Unauthorized: No active session" }` ([app/actions/order.js:113](app/actions/order.js#L113)).
2. **Attack 2 (IDOR / Cross-user mutation)**:  
   Signed in as Chala, targeting Abebe's order: `await cancelOrder("1");` -> Refused with `{ error: "Forbidden: Not the record owner" }` ([app/actions/order.js:122](app/actions/order.js#L122)).
3. **Attack 3 (Crafted open redirect)**:  
   Navigating to `/sign-in?next=https://example.com` -> Relative URL check strips domain and defaults to `/` ([app/actions/auth.js:27](app/actions/auth.js#L27)).
4. **URL ID Tampering**:  
   Navigating to `/orders/999` while unauthorized renders an explicit `Access Denied` gate ([app/orders/[id]/page.js:16](app/orders/[id]/page.js#L16)).

### B. Performance & Accessibility
- **Core Web Vitals**: CLS 0.02 (target < 0.1, passes). LCP 4.0s desktop / 8.5s mobile (target < 2.5s, missed) because the hero source PNG is 1.9 MB. Measured with `PerformanceObserver` under slow-4G and 4x CPU throttling; the script is at [scripts/measure-cwv.mjs](scripts/measure-cwv.mjs).
- **Keyboard Navigation**: 100% of routes and actions reachable using only Tab and Enter. Escape dismisses search and alerts. Universal `:focus-visible` ring in the brand green.
- **Touch Targets**: Every interactive button, link, and input is at least 44 px tall and wide.
- **Images**: Every `<Image>` carries explicit `sizes` and is served as WebP. The hero source PNG is 1.9 MB and is the one asset still over budget; see [PERF.md](PERF.md).

### C. Discovery & Metadata
- Absolute `og:image` dynamically rendered via Next.js `ImageResponse` ([app/opengraph-image.js](app/opengraph-image.js)).
- Valid `/sitemap.xml` and `/robots.txt` generated automatically.

---

## 5. The Five Mandatory Documents

1. **[README.md](README.md)**: Project overview, live deliverable URL, setup instructions, variables, and presentation guide.
2. **[AUTH.md](AUTH.md)**: Route protection matrix, layer proofs, line-by-line attack defense, and secret hygiene.
3. **[DATA.md](DATA.md)**: Server vs. client boundary inventory, cache keys, refresh rules, and debouncing.
4. **[PERF.md](PERF.md)**: Measured performance budget from the deployed build, with each number reproducible.
5. **[FUTURE.md](FUTURE.md)**: MoSCoW triage analysis, features consciously deferred, and future roadmap.

---

## 6. Presentation & Code Walkthrough Plan (8 Minutes)

### Timing Breakdown
- **0:00-1:00 (1 min)**: *What it is and who it is for*: Introduce Addis Eats as an authentic Ethiopian food delivery service solving courier tracking and ordering.
- **1:00-3:00 (2 mins)**: *The main flow, live*: Demonstrate live browsing on [https://addis-eats-capstone.vercel.app](https://addis-eats-capstone.vercel.app), add Shiro to cart, checkout, and watch real-time delivery map updates.
- **3:00-5:00 (2 mins)**: *One technical decision*: Explain why `app/menu/page.js` stays a Server Component that renders the client `FoodCard`, pushing the `"use client"` boundary down to the leaf that actually needs it (the add-to-cart button) instead of marking the whole menu interactive.
- **5:00-6:00 (1 min)**: *The three attacks refused*: Open DevTools console on the live site and demonstrate refusal of signed-out mutations, cross-account IDOR, and open redirects.
- **6:00-7:00 (1 min)**: *PERF.md*: Walk through the measured budget and be straight about what is missed: LCP is 4.0s desktop and 8.5s mobile against a 2.5s target because the hero source PNG is 1.9 MB, while CLS sits at 0.02 and passes.
- **7:00-8:00 (1 min)**: *What was cut & next steps*: Review [FUTURE.md](FUTURE.md): conscious triage of payment gateways to preserve core reliability, and what another week would deliver.

### The Five Files to Have Open in Tabs
1. **Server Component**: `app/menu/page.js`: *Why it is not a client component: it reads the catalogue and filters it on the server, so the dish grid ships as HTML and no data-fetching code reaches the browser.*
2. **Client Component**: `app/menu/DishSearch.js`: *Why it has to be client: it holds the search term in `useState`, debounces the keystrokes, and cancels the in-flight request.*
3. **Protected Action**: `app/actions/order.js`: *Both checks inside it: session existence verification and record ownership verification.*
4. **Data Query**: `app/menu/DishSearch.js` or `app/orders/OrderStatus.js`: *Where it runs and why: debounced SWR null-key fetching vs 3-second polling.*
5. **Deployment & Verification**: `README.md` / `VERIFICATION.md`: *Proof of clean Turbopack build, live URL, and passing security battery.*
