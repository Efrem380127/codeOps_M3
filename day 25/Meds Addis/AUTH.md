# AUTH.md — Authentication, Authorisation & The Three Attacks

Meds Addis · IBT College Canada CodeOps · Full Stack · Module 3 Frontend Capstone

This document records every private route, the layer that protects it, what each
layer actually proves, and the three attacks the application is designed to
refuse — with the line of code that refuses each one.

---

## 1. The threat model in one paragraph

The browser is not trusted. Anything the client sends — a URL parameter, a hidden
form field, a cart payload, a cookie — is a claim, not a fact. Every decision
that matters is therefore made on the server, from two things the client cannot
forge: the **session cookie** (signed with HMAC-SHA256, so it cannot be edited)
and the **stored record** (read fresh from the data layer, so it cannot be
misrepresented). Nothing else is consulted.

---

## 2. Session design

| Property | Value | Why |
|---|---|---|
| Cookie name | `meds_session` | One constant, `SESSION_COOKIE`, in `lib/session.js` |
| Payload | `base64url("<userId>.<issuedAt>")` + `.` + HMAC signature | The user id alone is forgeable; the signature is not |
| Signature | HMAC-SHA256 over the encoded payload, keyed on `SESSION_SECRET` | Tamper-evident |
| Comparison | `crypto.timingSafeEqual` | Constant-time, so the digest cannot be recovered byte by byte |
| `httpOnly` | `true` | An XSS bug cannot read the session out of `document.cookie` |
| `secure` | `true` in production | Never sent over plain HTTP |
| `sameSite` | `lax` | Blocks the cross-site POST half of CSRF, keeps top-level navigation working |
| `maxAge` | 7 days | Matches the `issuedAt` freshness window enforced in `readSession` |
| Expiry check | `Date.now() - issuedAt > maxAge` → `null` | A stolen cookie is not valid forever |

`readSession()` in `lib/auth.js` **never throws**. It returns `null` for anything
malformed, tampered with, or expired, so every caller can treat `null` as
"signed out" without a try/catch.

Passwords are stored as SHA-256 digests (`app/data/users.js`) and compared with
`timingSafeEqual` in `verifyPassword()`. The comparison also length-checks first,
because `timingSafeEqual` throws on mismatched buffer lengths.

> **Known limitation, stated honestly:** SHA-256 without a per-user salt is not
> suitable for real credentials. A production build moves to bcrypt or argon2 with
> a per-user salt — recorded in [FUTURE.md](FUTURE.md).

---

## 3. The three layers

The application does not rely on one check. It uses three, and they are
deliberately different in kind:

### Layer 1 — Edge middleware (`middleware.js`)

**What it proves:** that an obviously-signed-out visitor is redirected early,
before a route renders.

**What it does NOT prove:** anything about security. Its own comment says so:

> Middleware can be bypassed — by a matcher that does not cover a route, by a
> prefetch, and above all by a direct call to a server action or a route handler,
> neither of which passes through here at all.

The matcher is deliberately **narrow**:

```js
matcher: ["/checkout/:path*", "/orders/:path*", "/dispensary/:path*", "/dashboard/:path*"]
```

A broad matcher (`"/(.*)"`) is the classic mistake: it runs on every request
including static assets, costs latency, and *looks* like it protects everything
while protecting nothing that matters. This one covers only the routes that
genuinely require an account.

Middleware also verifies the signature rather than merely checking that a cookie
is present — a present-but-forged cookie is not a session.

### Layer 2 — Server Component checks (the control)

Every private page re-checks the session itself, and several check the role too:

| Route | Check | File |
|---|---|---|
| `/checkout` | `getSession()` → `redirect("/sign-in?next=/checkout")` | `app/checkout/page.js` |
| `/orders` | `getSession()` → redirect; scope by `user.id` | `app/orders/page.js` |
| `/orders/[id]` | `getSession()`; `order.userId !== user.id && !isStaff(user)` → **Access Denied** | `app/orders/[id]/page.js` |
| `/track/[id]` | same ownership rule | `app/track/[id]/page.js` |
| `/prescriptions` | `getSession()` → redirect | `app/prescriptions/page.js` |
| `/dispensary` | `getSession()` **and** `isStaff(user)` → **Access Denied** | `app/dispensary/page.js` |
| `/dashboard` | `getSession()` **and** `role === manager` → **Access Denied** | `app/dashboard/page.js` |

This is the layer that actually stops a request. It runs on the server, it is not
conditional on the UI having rendered a button, and it cannot be skipped by
editing a URL.

### Layer 3 — Checks inside every write (the last line)

`app/actions/order.js` and `app/actions/prescription.js` each re-verify before
touching data:

- `requireSession()` at the top of every exported action.
- **Ownership** checks for customer-initiated writes (`cancelOrder`).
- **Role** checks for staff-initiated writes (`advanceOrder`, `reviewPrescription`).

Hiding a button is not a security control. Anyone can open DevTools and call the
action directly — which is precisely why the check lives inside the action.

---

## 4. Why ownership and role are different checks

These look like the same idea and are not:

- `cancelOrder` — a customer acting on **their own** record. The question is
  *"is this record yours?"*, answered by comparing `order.userId` against the
  session user.
- `advanceOrder` / `reviewPrescription` — staff acting on **someone else's**
  record. The question is *"are you allowed to do this at all?"*, answered by the
  session user's role. "Is this record yours?" is the wrong question here and
  would lock pharmacists out of their own job.

They are kept as separate functions in separate places for that reason.

---

## 5. The three attacks

All three are run against the **deployed** URL from the browser console, signed
out or signed in as instructed.

### Attack 1 — Call a protected action while signed out

```js
// DevTools console, no session cookie
const { cancelOrder } = await import("/_next/static/chunks/app/actions/order.js");
await cancelOrder(null, new FormData());   // or call the action via any form
```

**Expected:** refused, not a crash.

**Refused by:** `requireSession()` at the top of `cancelOrder` in
`app/actions/order.js`:

```js
const user = await getSession();
const unauthorised = requireSession(user);
if (unauthorised) return unauthorised;
// → { ok: false, error: "You must be signed in to do that…" }
```

The action returns before it reads any order at all. There is no session, so
there is no user, so there is nothing to authorise.

**The line that refuses it:** the `requireSession(user)` guard in `cancelOrder`.

---

### Attack 2 — Signed in as yourself, mutate someone else's record (IDOR)

Sign in as **Abebe Bikila** (`abebe@medsaddis.et`), then target an order that
belongs to **Chala Kebede**:

```js
// Signed in as Abebe (usr_abebe). ord_1002 belongs to usr_chala.
const form = new FormData();
form.set("orderId", "ord_1002");
await cancelOrder(null, form);
```

**Expected:** refused on **ownership**, not on session. Abebe is authenticated —
that is not the problem.

**Refused by:** the ownership comparison in `cancelOrder`:

```js
const isOwner   = order.userId === user.id;   // "usr_chala" === "usr_abebe" → false
const mayOverride = isStaff(user);            // false for a customer
if (!isOwner && !mayOverride) {
  return { ok: false, error: "You can only cancel your own orders." };
}
```

The decision is made against `order.userId` — **the record as stored** — never
against anything the caller supplied. The `orderId` in the request is only used
to *find* a candidate; it never establishes permission.

The same rule protects the read paths. `GET /api/orders/:id` returns **403** when
`order.userId !== user.id && !isStaff(user)`, and `/orders/[id]` renders an
explicit **Access Denied** panel. Change an id in a private URL and you get a
refusal, not someone else's delivery address.

**The line that refuses it:** `if (!isOwner && !mayOverride)` in `cancelOrder`.

---

### Attack 3 — A crafted return link (open redirect)

Visit:

```
/sign-in?next=https://example.com
/sign-in?next=//example.com
/sign-in?next=/\example.com
```

**Expected:** you land on `/`, not on `example.com`.

**Refused by:** `safeRedirect()` in `lib/auth.js`, called by the sign-in route
handler *after* the credentials are verified:

```js
export function safeRedirect(target, fallback = "/") {
  if (typeof target !== "string" || target.length === 0) return fallback;
  if (!target.startsWith("/"))  return fallback;   // https://example.com → /
  if (target.startsWith("//") || target.startsWith("/\\")) return fallback;
  return target;                                    // //example.com, /\example.com → /
}
```

Three cases, three reasons:

1. `https://example.com` — does not start with `/`, so it is not a path.
2. `//example.com` — a **protocol-relative URL**. It starts with `/` but browsers
   treat it as a host, which is the bug the naive check misses.
3. `/\example.com` — some browsers normalise the backslash to `/`, producing
   `//example.com` again.

The check is applied **on the server**, in the route handler. The client does not
validate `next` at all, because a check the client can skip is not a check.

**The line that refuses it:** `if (!target.startsWith("/")) return fallback;`
and the protocol-relative guard beneath it in `safeRedirect()`.

---

### Attack 3b — A private URL with a changed id

```
/orders/ord_1002      →  signed in as Abebe, ord_1002 belongs to Chala
/dispensary           →  signed in as a customer
/dashboard            →  signed in as a pharmacist
```

**Expected:** a refusal, not data.

| URL | As | Result |
|---|---|---|
| `/orders/ord_1002` | Abebe (customer) | **Access Denied** panel — `app/orders/[id]/page.js` |
| `/api/orders/ord_1002` | Abebe (customer) | **403** — `app/api/orders/[id]/route.js` |
| `/dispensary` | Abebe (customer) | **Access Denied** — role check in `app/dispensary/page.js` |
| `/dashboard` | Meron (pharmacist) | **Access Denied** — manager-only, `app/dashboard/page.js` |

---

## 6. Route protection matrix

| Route | Public? | Session | Role | Read scope |
|---|---|---|---|---|
| `/` | ✅ public | — | — | — |
| `/medicines` | ✅ public | — | — | — |
| `/medicines/[id]` | ✅ public | — | — | — |
| `/cart` | ✅ public | — | — | client state only |
| `/sign-in` | ✅ public | — | — | — |
| `/checkout` | 🔒 private | ✅ layer 1 + 2 | any | own prescriptions only |
| `/orders` | 🔒 private | ✅ layer 1 + 2 | any | own orders (staff: all) |
| `/orders/[id]` | 🔒 private | ✅ layer 2 | any | own order, or any if staff |
| `/track/[id]` | 🔒 private | ✅ layer 2 | any | own order, or any if staff |
| `/prescriptions` | 🔒 private | ✅ layer 2 | any | own prescriptions only |
| `/dispensary` | 🔒 private | ✅ layer 1 + 2 | pharmacist, manager | all |
| `/dashboard` | 🔒 private | ✅ layer 1 + 2 | manager only | all |
| `/api/medicines` | ✅ public | — | — | — |
| `/api/orders` | 🔒 private | ✅ layer 3 | any | session-scoped, **no `?userId=`** |
| `/api/orders/[id]` | 🔒 private | ✅ layer 3 | any | own, or 403 |
| `/api/orders/[id]/stream` | 🔒 private | ✅ layer 3 | any | own, or 403 |
| `/api/prescriptions` | 🔒 private | ✅ layer 3 | any | own; `?status=pending` is staff-only |
| `/api/auth/session` | 🔒 private | — | — | id, name, email, role only |
| `/api/auth/sign-in` | ✅ public | — | — | — |
| `/api/auth/sign-out` | ✅ public | — | — | clears the cookie |

**A filter can narrow what you may see; it can never widen it.** `GET
/api/prescriptions?status=pending` checks the staff role *before* applying the
filter, so a customer asking for `pending` receives 403 — not other people's
prescriptions.

**There is no `?userId=` anywhere.** Accepting one would be an invitation to read
someone else's history. The session is the only source of "whose records am I
allowed to see".

---

## 7. What the session endpoint deliberately does not return

`GET /api/auth/session` returns **only** `id`, `name`, `email`, `role` and
`licenceNumber`. The password digest lives on the same record and must never be
serialised. The route builds the response object explicitly rather than spreading
the user, so a field added to the fixture later cannot leak by accident.

---

## 8. Secret hygiene

| Secret | Where it lives | Committed? |
|---|---|---|
| `SESSION_SECRET` | `.env.local` / deployment environment | ❌ never — `.env*.local` and `.env*` are in `.gitignore`; only `.env.example` is tracked |
| `NEXT_PUBLIC_APP_URL` | environment | ❌ never (not sensitive, but environment-specific) |

**`NEXT_PUBLIC_` means inlined at build time and readable by anyone.** Nothing
secret may carry that prefix. The sign-in cookie is `httpOnly`, so it is not
reachable from JavaScript at all — `NEXT_PUBLIC_` and `httpOnly` are two
different mechanisms and neither substitutes for the other.

`lib/auth.js` warns loudly at startup if `NEXT_PUBLIC_APP_URL` is set but
`SESSION_SECRET` is missing in production, and falls back to a public default so
the app still runs — a missing secret is a serious misconfiguration, but a
failing deployment on presentation day is worse.

**If a secret is ever committed, deleting the file is not enough.** It stays in
the git history. The key must be rotated.

---

## 9. Summary — what proves what

| Claim | Proof |
|---|---|
| A signed-out visitor cannot mutate anything | Attack 1 refused inside the action, before any read |
| A customer cannot touch another customer's data | Attack 2 refused on `order.userId` vs session; 403 on the API; Access Denied on the page |
| A crafted link cannot leave the site | Attack 3 refused by `safeRedirect()` server-side |
| The cookie cannot be forged | HMAC-SHA256 signature verified in both middleware and `getSession()` |
| The cookie cannot be read by script | `httpOnly` |
| The cookie is not sent over plain HTTP | `secure` in production |
| Private pages are not indexed | `robots.js` disallows every private route; `sitemap.js` lists public routes only |
| Hiding a button is not the control | Every write re-checks on the server, inside the action |
