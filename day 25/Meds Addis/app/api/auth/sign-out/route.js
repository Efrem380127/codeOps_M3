import { cookies } from "next/headers";

import { sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";

/**
 * POST /api/auth/sign-out
 *
 * Clearing the cookie is the whole operation — the session is stateless, so
 * there is no server-side record to delete. The flags are repeated exactly as
 * they were set, because a cookie deleted with different path or domain
 * attributes is not actually deleted.
 */
export async function POST() {
  const cookieStore = await cookies();

  const { maxAge, ...options } = sessionCookieOptions();
  cookieStore.set(SESSION_COOKIE, "", { ...options, maxAge: 0 });

  return Response.json({ ok: true });
}
