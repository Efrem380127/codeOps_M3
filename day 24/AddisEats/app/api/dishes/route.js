import { dishes } from "../../data/dishes";
import { filterDishes } from "../../lib/cart";

const DEFAULT_LIMIT = 3;
const MAX_LIMIT = 24;

/**
 * GET /api/dishes?search=&page=&limit=
 *
 * A paged view of the menu. Consumed by the live search panel on /menu, and
 * usable directly as JSON.
 *
 * Two things were wrong with the previous version of this handler:
 *
 *  - It searched `dish.name` only, so the panel's own placeholder suggested
 *    "Shiro" (which works) while a search for a word that appears only in a
 *    description — "berbere", "collard" — returned nothing. It now delegates to
 *    the same `filterDishes` the server-rendered menu uses, so the two cannot
 *    disagree about what matches.
 *  - `limit` was taken from the query string and passed straight to `slice`.
 *    A negative or absurd value produced a confusing empty or enormous
 *    response; both are now clamped.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const search = (searchParams.get("search") || searchParams.get("q") || "").trim();

  const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const requestedLimit = Number.parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);

  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const matched = filterDishes(dishes, "all", search);
  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Clamp the page into range rather than returning an empty slice: a stale
  // link to page 9 of a 2-page result should show the last page, not nothing.
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;

  const start = (page - 1) * limit;

  return Response.json(
    {
      dishes: matched.slice(start, start + limit),
      total,
      totalPages,
      page,
      limit
    },
    { headers: { "cache-control": "no-store" } }
  );
}
