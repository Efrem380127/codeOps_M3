import { getSession } from "@/lib/session";
import { isStaff } from "@/app/data/users";
import {
  getPrescriptionsForUser,
  getAllPrescriptions,
  getPendingPrescriptions,
} from "@/lib/prescriptions";

/**
 * GET /api/prescriptions
 *
 *   ?status=pending  the pharmacist work queue (staff only)
 *   (no status)      the caller's own prescriptions
 *
 * Note that a customer asking for ?status=pending does not receive other
 * people's prescriptions — the staff check decides the scope, not the query
 * parameter. A filter can narrow what you may see; it can never widen it.
 */
export async function GET(request) {
  const user = await getSession();

  if (!user) {
    return Response.json(
      { error: "Sign in to view prescriptions." },
      { status: 401 },
    );
  }

  const status = new URL(request.url).searchParams.get("status");

  if (status === "pending") {
    if (!isStaff(user)) {
      return Response.json(
        { error: "Only dispensary staff can view the review queue." },
        { status: 403 },
      );
    }

    const queue = await getPendingPrescriptions();
    return Response.json(
      { prescriptions: queue, count: queue.length },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const own = isStaff(user)
    ? await getAllPrescriptions()
    : await getPrescriptionsForUser(user.id);

  return Response.json(
    { prescriptions: own, count: own.length },
    { headers: { "cache-control": "no-store" } },
  );
}
