import { NextResponse } from "next/server";
import { getSession } from "./lib/auth";

/**
 * Route guard for the authenticated areas.
 *
 * This file is `proxy.js`, not `middleware.js`. Next.js 16 renamed the
 * convention and `middleware` now logs a deprecation warning on every build.
 * The only changes are the filename and the export name — the request and
 * response API is identical.
 *
 * It runs before the matched routes are rendered, so an unauthenticated visitor
 * never reaches the checkout or order pages at all; they are redirected to
 * sign-in with a `next` parameter naming where they were trying to go.
 *
 * That parameter is validated by `signIn` before it is used — it must start
 * with a single `/` — which is what stops `?next=https://elsewhere.example`
 * from turning this into an open redirect.
 */
export async function proxy(request) {
  const session = await getSession(request);

  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    const next = request.nextUrl.pathname + request.nextUrl.search;
    signInUrl.searchParams.set("next", next);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout", "/orders", "/orders/:path*"]
};
