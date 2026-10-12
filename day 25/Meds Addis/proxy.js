import { NextResponse } from "next/server";

import { readSession, SESSION_COOKIE } from "@/lib/session-token";

/**
 * Edge proxy — the first of three layers.
 *
 * NAMING: this file was `middleware.js` up to Next.js 15. Next.js 16 renamed the
 * convention to `proxy.js` and the exported function to `proxy`, because the
 * thing it actually does is intercept and rewrite a request before it reaches a
 * route — "middleware" implied a general-purpose hook layer that it never was.
 * `middleware.js` still works in 16.3 but logs a deprecation warning on every
 * build, so it is migrated here.
 *
 * WHAT THIS IS: a cheap, early gate. It runs before the route renders, has no
 * data access, and exists to bounce an obviously-signed-out visitor to the
 * sign-in page with a `next` parameter so they land where they were going.
 *
 * WHAT THIS IS NOT: the security check. The proxy can be bypassed — by a matcher
 * that does not cover a route, by a prefetch, and above all by a direct call to
 * a server action or a route handler, neither of which passes through here at
 * all. Every route and every action verifies the session itself. If this file
 * were deleted the application would still be secure; it would just be less
 * pleasant to use.
 *
 * The matcher is deliberately NARROW. A broad matcher ("/(.*)") runs on every
 * request including static assets and public pages, which costs latency and —
 * worse — is the classic mistake of appearing to protect everything while
 * actually protecting nothing that matters.
 *
 * Note the import: `@/lib/session-token`, not `@/lib/auth`. The proxy runs in
 * the Edge runtime, which has no `node:crypto`, so the HMAC here is implemented
 * with Web Crypto. Importing lib/auth.js would emit an Edge-runtime warning at
 * build time and fail at request time. The token format is identical in both
 * modules because there is only one implementation of it.
 */
export async function proxy(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  /*
   * Verify the signature here too: a present-but-forged cookie should not be
   * treated as a signed-in visitor. `document.cookie = "meds_session=usr_dawit"`
   * produces a cookie that fails this check, so the visitor is sent to sign in
   * rather than through to the page.
   */
  const userId = token ? await readSession(token) : null;

  if (userId) {
    return NextResponse.next();
  }

  const signIn = new URL("/sign-in", request.url);

  // Preserve where they were headed, so the sign-in form can return them.
  signIn.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(signIn);
}

export const config = {
  /*
   * Only the routes that genuinely require an account. The home page, the
   * catalogue, the medicine detail pages and the sign-in page are public and
   * must not pass through here.
   *
   * /orders, /dispensary and /dashboard are included for convenience — their
   * pages re-check the session and the role regardless.
   */
  matcher: [
    "/checkout/:path*",
    "/orders/:path*",
    "/dispensary/:path*",
    "/dashboard/:path*",
  ],
};
