import { getSession } from "@/lib/auth";

/**
 * GET /api/auth/session
 *
 * Returns the signed-in user, or `{ user: null }`.
 *
 * This exists so the header can show account state *without* the root layout
 * reading cookies. That distinction is load-bearing, not stylistic: reading
 * `cookies()` in a layout opts every route in the application into dynamic
 * rendering, which would cost `/menu` its `revalidate = 60` ISR window. The
 * session check is therefore moved off the server render path and onto this
 * one small request, which SWR then caches for the session.
 *
 * `cache-control: no-store` is set on both branches. This response is
 * per-visitor and must never land in a shared cache — a cached
 * `{ user: null }` would show a signed-out header to a signed-in visitor.
 *
 * The response deliberately exposes only id, name and role. Nothing else on the
 * session payload is needed by the header, and a route handler that returns
 * more than the caller needs is how fields leak.
 */
export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json(
      { user: null },
      { headers: { "cache-control": "no-store" } }
    );
  }

  return Response.json(
    {
      user: {
        id: session.id,
        name: session.name,
        role: session.role
      }
    },
    { headers: { "cache-control": "no-store" } }
  );
}
