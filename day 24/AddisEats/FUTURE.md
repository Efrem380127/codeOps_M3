# FUTURE.md: MoSCoW Triage & Roadmap

This document captures the triage decisions made during the Frontend Capstone build, recording what was prioritized, what was consciously deferred, and the roadmap for future development.

---

## 1. MoSCoW Prioritization Matrix

| Category | Definition | Features Evaluated & Decision |
|---|---|---|
| **Must** | *Incomplete without it* | • Core food ordering flow from menu to cart to checkout to order tracking.<br>• Three-layer authentication and session cookies.<br>• Refusal of all 3 security attacks (signed-out mutation, cross-user IDOR, open redirect).<br>• Zero clickable divs, full keyboard navigation (Tab/Enter/Escape), and 44px touch targets.<br>• Clean build with zero TypeScript and Turbopack errors, deployed to Vercel production. |
| **Should** | *Visibly missing, but core application still works* | • A real map tile layer behind the delivery map, which is currently hand-rolled SVG with no basemap.<br>• SSE live driver coordinates stream (`/api/orders/[id]/stream`).<br>• Revenue and order analytics charts with accessible data tables.<br>• RFC 4180 compliant CSV export button for order history.<br>• Comprehensive empty states for brand-new accounts with no orders. |
| **Could** | *Consciously cut during triage to protect the delivery deadline* | • Payment gateway integration (Stripe, Telebirr, CBE Birr).<br>• Bi-directional WebSockets replacing SSE and SWR polling.<br>• Customer SMS / Push notifications on delivery dispatch.<br>• Multi-language internationalization (English & Amharic i18n switcher).<br>• Dedicated Courier driver mobile app with live GPS sharing.<br>• Dark / Light mode visual theme switcher. |

---

## 2. Why the "Coulds" Were Cut

1. **Payment Gateway Integration (Telebirr / Stripe)**:
   - *Rationale*: A mock or cash-on-delivery state allows the full ordering lifecycle to complete end-to-end without requiring third-party merchant approval or external sandbox latency during live assessment.
2. **Bi-directional WebSockets**:
   - *Rationale*: The combination of SWR 3-second polling with server `fallbackData` and Server-Sent Events (SSE) achieves 100% of the live driver tracking requirements without the operational complexity and server overhead of maintaining standing WebSocket connections on serverless infrastructure.
3. **Multi-language Amharic / English Switcher**:
   - *Rationale*: While culturally authentic, dynamic i18n routing would have duplicated route testing without adding architectural breadth to the core React/Next.js evaluation rubric.

---

## 3. What Another Week Would Give

If granted another week of development, the roadmap would execute in the following order:

1. **Telebirr & CBE Birr Payment Integration**:
   - Webhook-verified payment callbacks updating order status from `pending_payment` to `preparing`.
2. **Driver GPS Companion App**:
   - A lightweight mobile Progressive Web App (PWA) allowing couriers to report live coordinates to the SSE pipeline via Geolocation API.
3. **End-to-End Test Suite**:
   - Playwright automated regression tests running headlessly in CI/CD against the preview deployment for keyboard navigation and double-tap prevention.
4. **Offline Cart Persistence**:
   - Service worker caching with IndexedDB cart storage to enable offline dish browsing and cart queuing during spotty mobile connectivity.
