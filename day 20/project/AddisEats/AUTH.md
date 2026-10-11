# AUTH.md — Authentication, Authorization & Three-Layer Security

This document details the multi-layer security model, route guards, ownership verification, and security testing against the Addis Eats application.

---

## 1. Decision One: Who May See What

| Route | Who | Protected By | What That Proves |
|---|---|---|---|
| `/menu` | **Everyone** | None (Public) | It is public and indexable by search engines. |
| `/menu/[id]` | **Everyone** | None (Public) | Public dish detail pages for search engines and social sharing. |
| `/cart` | **Everyone** | None (Public) | Guests can assemble meals prior to checkout. |
| `/checkout` | **Everyone (Guest & Auth)** | Form schema validation + session linking | Guests can place orders; authenticated users have orders bound to their account. |
| `/orders` | **The Owner** | Edge Middleware + Server Component guard + Scoped query | The user is signed in, and only their own records are returned. |
| `/orders/[id]` | **The Owner** | Server Component ownership check | The authenticated user owns the requested order record. |
| `/kitchen` | **Staff Only** | Server Component role check (`role === "staff"`) | The user is signed in and possesses the staff role. |

> **Why the fourth column matters**: "Protected by middleware" is never a sufficient answer. Middleware only proves that a cookie exists. Documenting precisely what each layer establishes shows where vulnerabilities lie — which is almost always a server action that blindly trusts an ID it was handed.

---

## 2. The Three Layers of Protection

1. **Layer 1: Edge / Request Middleware (`middleware.js`)**
   - Intercepts requests before route execution on edge runtime.
   - Verifies the cryptographic HMAC signature of the session cookie (`SESSION_SECRET`).
   - Redirects unauthenticated visitors attempting to reach `/orders` or `/orders/*` to `/sign-in?next=<destination>`.
   - Never leaks internal route structures to unauthorized visitors.

2. **Layer 2: Server Component Guard (`app/orders/page.js`, `app/orders/[id]/page.js`, `app/kitchen/page.js`)**
   - Re-verifies `await getSession()` inside the React Server Component render cycle.
   - Scopes data queries strictly to `session.id` (`getOrdersForUser(session.id)`).
   - Enforces role requirements on staff-only routes (`session.role === "staff"`).
   - Prevents IDOR (Insecure Direct Object References) if an attacker crafts an arbitrary ID in the URL.

3. **Layer 3: Server Action & Mutation Gate (`app/actions/order.js`)**
   - Server Actions are standalone POST endpoints callable directly without visiting the UI.
   - Every action (`placeOrder`, `cancelOrder`) re-reads and cryptographically verifies the session cookie.
   - Validates that the caller owns the targeted record before modifying state.
   - Rejects unauthenticated calls with 401 Unauthorized and cross-account attacks with 403 Forbidden.

---

## 3. The Three Security Attacks (Tested on Live URL)

### Attack 1: Calling a Server Action While Signed Out
- **Browser Console Command**:
  ```javascript
  await cancelOrder("ord_812");
  ```
- **Line That Stopped It**:
  - `app/actions/order.js`, Lines 57–59:
    ```javascript
    if (!session) {
      return { error: "Unauthorized: No active session" };
    }
    ```
- **Observed Result**: The action executed on the server, detected no valid session cookie via `getSession()`, and returned `{ error: "Unauthorized: No active session" }`. No records were updated and the server did not crash.

---

### Attack 2: Signed In as Someone Else (IDOR / Ownership Violation)
- **Browser Console Command**:
  ```javascript
  // Signed in as user "Chala Kebede" (id: usr_chala_kebede)
  await cancelOrder("1"); // Targeting Order #1 owned by "Abebe Bikila" (id: usr_abebe)
  ```
- **Line That Stopped It**:
  - `app/actions/order.js`, Lines 66–68:
    ```javascript
    if (order.sessionId !== session.id && order.owner !== session.name && session.role !== "staff") {
      return { error: "Forbidden: Not the record owner" };
    }
    ```
- **Observed Result**: The session was valid, but record comparison failed because `order.sessionId ("usr_abebe") !== session.id ("usr_chala_kebede")`. The action halted with `{ error: "Forbidden: Not the record owner" }`. The target order remained untouched.

---

### Attack 3: Crafted Open Redirect via Sign-In Link
- **Browser URL Test**:
  ```
  https://addis-eats-six.vercel.app/sign-in?next=https://example.com
  // Also tested: /sign-in?next=//evil.com
  ```
- **Line That Stopped It**:
  - `app/actions/auth.js`, Lines 27–29:
    ```javascript
    if (typeof rawNext === "string" && rawNext.startsWith("/") && !rawNext.startsWith("//")) {
      destination = rawNext;
    }
    ```
- **Observed Result**: The external domain target failed the relative URL validation check (`startsWith("/")` and `!startsWith("//")`). The server action sanitized the destination and defaulted to `"/"`. The visitor remained securely on Addis Eats.

---

### Attack 4: URL ID Tampering on Private Orders Page
- **Browser URL Test**:
  ```
  https://addis-eats-six.vercel.app/orders/999
  ```
- **Line That Stopped It**:
  - `app/orders/[id]/page.js`, Lines 24–30:
    ```javascript
    if (order.sessionId !== session.id && session.role !== "staff") {
      return <div className="error-card">Access Denied: You do not own this order.</div>;
    }
    ```
- **Observed Result**: Renders an explicit Access Denied gate rather than revealing someone else's order data.

---

## 4. Secret Hygiene in Browser Bundles

1. **Client-Side Environment Variables**: Only variables prefixed with `NEXT_PUBLIC_` (`NEXT_PUBLIC_APP_URL`) are present in client JavaScript.
2. **Server-Side Secrets**: `SESSION_SECRET` is marked as a secret on Vercel and is strictly consumed inside server files (`app/actions/auth.js`, `lib/auth.js`).
3. **Bundle Inspection**: Searching the browser network bundles for `SESSION_SECRET` confirms zero instances downloaded by the client.
