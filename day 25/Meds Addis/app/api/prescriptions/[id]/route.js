import { getSession } from "@/lib/session";
import { isStaff } from "@/app/data/users";
import { getPrescriptionById } from "@/lib/prescriptions";

/** GET /api/prescriptions/:id — own, or any if staff. */
export async function GET(request, { params }) {
  const user = await getSession();

  if (!user) {
    return Response.json(
      { error: "Sign in to view this prescription." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const prescription = await getPrescriptionById(id);

  if (!prescription) {
    return Response.json(
      { error: "Prescription not found", id },
      { status: 404 },
    );
  }

  if (prescription.userId !== user.id && !isStaff(user)) {
    return Response.json(
      { error: "You do not have access to this prescription." },
      { status: 403 },
    );
  }

  return Response.json(prescription, {
    headers: { "cache-control": "no-store" },
  });
}
