# PERF.md: Performance Budget & Optimization Audit

Performance measurements, Core Web Vitals audit, and asset pipeline overhaul for Addis Eats.

Everything below was re-measured on the current deployed build. The method is
stated for each number so it can be reproduced rather than taken on trust. Where
a target is currently missed, it says so.

---

## 1. The Performance Budget

| Measure | Target | Measured (this build) | Status | What Moves It |
|---|---|---|---|---|
| **LCP, desktop** | Under 2.5s | **4.0s** | Missed | The hero image is `priority`, but the page still ships a large client bundle ahead of paint. |
| **LCP, mobile (Slow 4G, 4x CPU)** | Under 2.5s | **8.5s** | Missed | The hero PNG is 1.9 MB on disk. At DPR 3 a 390 px viewport requests it near its full width, and the throttled connection has to move it before the headline paints. |
| **CLS** | Under 0.1 | **0.02 mobile / 0.001 desktop** | Passed | Explicit `width`/`height` on every `<Image>` and `next/font` metric overrides reserve the boxes before pixels arrive. |
| **TTFB** | Under 0.8s | **0.30s desktop / 1.35s mobile** | Passed desktop / missed mobile | Desktop hits the Vercel edge cache. The mobile figure is dominated by the throttled round trip and the per-request session read in the shared layout. |
| **JS payload, `/menu`** | Under 120 kB | **607 kB uncompressed** | Missed | 13 script chunks, of which the three framework chunks (224 kB + 131 kB + 110 kB) are almost all of it. The route's own code is under 30 kB. |
| **Largest source asset** | Under 150 kB | **1.9 MB (`hero.png`)** | Missed | `next/image` serves it as WebP (about 104 kB at the common breakpoints), but the source file itself is well over budget and is what the mobile request derives from. |

> **Fill the third column twice**: A budget with only the final number in it
> proves nothing. The measured column above is the honest starting point, and the
> "What Moves It" column is the work that has to happen next.

### How these were measured

- **LCP, CLS, TTFB**: `PerformanceObserver` on the deployed URL at
  `https://addis-eats-capstone.vercel.app/`, with Chrome DevTools Protocol
  network throttling (150 ms latency, 1.6 Mbps down) and 4x CPU throttling for
  the mobile row, 1x for desktop. Reproduce with `node scripts/measure-cwv.mjs`.
- **JS payload**: the `/menu` HTML was fetched, every
  `/_next/static/**/*.js` it references was downloaded, and the uncompressed
  byte counts were summed. Next.js 16 under Turbopack no longer prints a
  "First Load JS" column into the build output, so it has to be measured this
  way.
- **Asset sizes**: `ls` on `public/`.

---

## 2. Technical Breakdown: What Is Actually In The Build

### A. Image Pipeline (`next/image`)
- **Explicit Dimensions**: Every `<Image>` carries `width` and `height`, so the
  browser reserves the box before the bytes land. This is what keeps CLS at
  0.02 rather than the tens of hundredths an unreserved `<img>` produces.
- **Responsive `sizes`**: The hero declares `sizes="100vw"` and the dish cards
  declare their breakpoints, so the preload scanner asks for the resolution the
  viewport needs instead of a desktop-sized file.
- **Single above-the-fold `priority`**: The hero image is the only `priority`
  image on the home page. Everything below the fold lazy-loads.
- **The remaining cost**: the hero source is a 1.9 MB PNG. It is transcoded on
  demand, but the mobile request is derived from it, and that derivation is the
  single biggest contributor to the mobile LCP above. Re-exporting it at
  roughly 1600 px wide and a modern format is the highest-value next step.

### B. Self-Hosted Typography (`next/font`)
- Three families are loaded through `next/font/google` in `app/layout.tsx`:
  **Archivo** (headlines and UI), **Caveat** (the script sublines), and
  **IBM Plex Mono** (order numbers and timers).
- The files are fetched at build time and self-hosted, so there is no
  render-blocking request to a third-party font host.
- `next/font` emits fallback metric overrides, so the system fallback occupies
  the same space as the custom face and swapping in does not shift layout.

### C. Server-Client Boundary
- `"use client"` is pushed down to the leaves that need it:
  `app/menu/DishSearch.js` (holds the search term),
  `app/components/FoodCard.js` (holds the add-to-cart action),
  `app/components/CartContents.js` and `app/components/CartLink.js` (read the
  cart context), and `app/order-status/LiveOrderStatus.js` (the SSE stream).
- `app/menu/page.js`, `app/components/FeaturedDishes.js` and
  `app/components/Icon.tsx` stay on the server, so the dish grid is delivered
  as HTML.
- This keeps the route's own JavaScript small. It does not shrink the framework
  chunks, which is why the payload row above is dominated by them.

### D. No Third-Party Scripts
- The application ships no analytics or tracking script, so there is no
  `next/script` and no `lazyOnload` strategy in use. Earlier drafts of this
  document described an analytics pipeline that was never added to the project.
