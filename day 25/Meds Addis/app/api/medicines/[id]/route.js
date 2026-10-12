import { getMedicineById } from "@/lib/catalog";

/** GET /api/medicines/:id — 200 with the record, or 404. */
export async function GET(request, { params }) {
  const { id } = await params;
  const medicine = await getMedicineById(id);

  if (!medicine) {
    return Response.json(
      { error: "Medicine not found", id },
      { status: 404 },
    );
  }

  return Response.json(medicine, {
    headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
