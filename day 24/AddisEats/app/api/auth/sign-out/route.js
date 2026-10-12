import { clearSessionCookie } from "@/lib/auth";

/**
 * POST /api/auth/sign-out
 *
 * Clears the session cookie. POST rather than GET because this changes state —
 * a GET sign-out can be triggered by any prefetcher, crawler or `<img>` tag that
 * happens to hit the URL, which is how a visitor gets logged out by a link
 * preview bot.
 *
 * The client calls this and then revalidates the SWR session key, so the header
 * updates without a full page reload.
 */
export async function POST() {
  await clearSessionCookie();

  return Response.json(
    { ok: true },
    { headers: { "cache-control": "no-store" } }
  );
}
