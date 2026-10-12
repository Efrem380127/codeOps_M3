import { cookies } from "next/headers";

import { authenticate, signSession, safeRedirect } from "@/lib/auth";
import { sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";
import { signInSchema, fieldErrors } from "@/lib/schema";

/**
 * POST /api/auth/sign-in
 *
 * A route handler rather than a server action, because it must set a cookie on
 * a redirect and return a `redirectTo` the client navigates to. Both are
 * clearer here than inside an action.
 *
 * Three things happen, in order:
 *   1. Validate the shape of the input.
 *   2. Check the credentials — one generic failure message either way, so the
 *      response does not reveal whether an email address exists.
 *   3. Sanitise the redirect target, then set a signed, httpOnly cookie.
 *
 * Step 3's sanitising is what makes attack 3 fail: /sign-in?next=https://evil.example
 * is refused and the visitor lands on "/" instead.
 */
export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { email, password, next } = parsed.data;

  const user = authenticate(email, password);

  if (!user) {
    // One message for "no such account" and "wrong password" alike.
    return Response.json(
      { error: "That email address and password do not match an account." },
      { status: 401 },
    );
  }

  /*
   * THE OPEN-REDIRECT CHECK.
   *
   * `next` arrives from the query string, which means an attacker can put
   * anything in it. safeRedirect() allows only path-relative targets and
   * rejects absolute URLs, protocol-relative "//host" and the "/\host" form
   * that some browsers normalise to "//host".
   */
  const destination = safeRedirect(next, "/");

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    await signSession(user.id),
    sessionCookieOptions(),
  );

  return Response.json({
    redirectTo: destination,
    user: { id: user.id, name: user.name, role: user.role },
  });
}
