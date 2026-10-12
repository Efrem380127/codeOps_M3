import { getSession } from "@/lib/session";
import { isStaff } from "@/app/data/users";
import { readOrder } from "@/lib/orders";

/**
 * GET /api/orders/:id
 *
 * The order status component polls this. The ownership check is the same one
 * the server action uses — an order id is not a capability.
 */
export async function GET(request, { params }) {
  const user = await getSession();

  if (!user) {
    return Response.json(
      { error: "Sign in to view this order." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const order = readOrder(id);

  if (!order) {
    return Response.json({ error: "Order not found", id }, { status: 404 });
  }

  if (order.userId !== user.id && !isStaff(user)) {
    /*
     * 403, not 404. The order exists and the caller is authenticated — they are
     * simply not allowed to see it. Returning 404 here would be defensible too
     * (it hides existence), but 403 is the honest answer and the one the UI
     * renders as "Access denied" rather than "not found".
     */
    return Response.json(
      { error: "You do not have access to this order." },
      { status: 403 },
    );
  }

  return Response.json(order, { headers: { "cache-control": "no-store" } });
}
