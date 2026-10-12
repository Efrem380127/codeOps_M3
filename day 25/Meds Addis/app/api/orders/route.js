import { getSession } from "@/lib/session";
import { isStaff } from "@/app/data/users";
import { getOrders, getOrdersForUser } from "@/lib/orders";

/**
 * GET /api/orders
 *
 * Session-scoped on purpose. A customer receives their own orders; staff
 * receive the whole book. There is no `?userId=` parameter, because accepting
 * one would be an invitation to read someone else's history — the session is
 * the only source of "whose orders am I allowed to see".
 */
export async function GET() {
  const user = await getSession();

  if (!user) {
    return Response.json(
      { error: "Sign in to view orders." },
      { status: 401 },
    );
  }

  const orders = isStaff(user)
    ? await getOrders()
    : await getOrdersForUser(user.id);

  return Response.json(
    { orders, count: orders.length, scope: isStaff(user) ? "all" : "own" },
    // Never cached: the response depends on the caller's session.
    { headers: { "cache-control": "no-store" } },
  );
}
