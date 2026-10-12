import { getSession } from "@/lib/session";

/**
 * GET /api/auth/session
 *
 * Returns the signed-in user, or `{ user: null }`.
 *
 * This exists so the header can show account state WITHOUT the root layout
 * reading cookies — if it did, every route in the application would become
 * dynamic and the catalogue would lose its static rendering and ISR.
 *
 * The response deliberately exposes only id, name, email and role. The password
 * digest lives on the same record and must never be serialised.
 */
export async function GET() {
  const user = await getSession();

  if (!user) {
    return Response.json(
      { user: null },
      { headers: { "cache-control": "no-store" } },
    );
  }

  return Response.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        licenceNumber: user.licenceNumber ?? null,
      },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
