import { getMedicines, filterMedicines, paginate } from "@/lib/catalog";

/**
 * GET /api/medicines
 *
 * Query parameters:
 *   q         free text across brand name, generic name, category and tags
 *   category  exact therapeutic category
 *   page      1-based
 *   pageSize  default 6, capped at 50
 *
 * Deliberately public: the catalogue is not private data. Anything that *is*
 * private (orders, prescriptions) checks the session inside its own handler.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const page = Number(searchParams.get("page")) || 1;

  // Clamp the page size so a caller cannot ask for the whole table at once.
  const requestedSize = Number(searchParams.get("pageSize")) || 6;
  const pageSize = Math.min(Math.max(1, requestedSize), 50);

  const all = await getMedicines();
  const filtered = filterMedicines(all, { q, category });
  const paged = paginate(filtered, page, pageSize);

  return Response.json(
    {
      medicines: paged.items,
      page: paged.page,
      pageSize: paged.pageSize,
      total: paged.total,
      totalPages: paged.totalPages,
      query: { q, category },
    },
    {
      headers: {
        // Public data: let the CDN hold it briefly. The catalogue revalidates
        // every 60s anyway, so this only smooths bursts of search keystrokes.
        "cache-control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    },
  );
}
