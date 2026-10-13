/**
 * Meds Addis — catalogue access.
 *
 * The read side of the pharmacy. Everything here is server-safe and, except for
 * the stock helpers, async — so the pages that call it can stream.
 *
 * `SIMULATED_LATENCY_MS` stands in for the Module 4 API round-trip. It is kept
 * small on purpose: it is long enough that the Suspense boundaries and loading
 * skeletons are genuinely exercised, and short enough not to distort the
 * performance budget in PERF.md.
 */

import {
  medicines,
  categories,
  findMedicine,
  LOW_STOCK_THRESHOLD,
} from "@/app/data/medicines";
import { reviewsForMedicine } from "@/app/data/reviews";

export { categories, LOW_STOCK_THRESHOLD };

const SIMULATED_LATENCY_MS = 250;

function wait(ms = SIMULATED_LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Whole catalogue, as the API would return it. */
export async function getMedicines() {
  await wait();
  return medicines;
}

/** One medicine, or null. Callers turn null into notFound(). */
export async function getMedicineById(id) {
  await wait();
  return findMedicine(id);
}

/** The ids used by generateStaticParams — synchronous, so the build can use it. */
export function medicineIds() {
  return medicines.map((medicine) => medicine.id);
}

/**
 * Reviews for one medicine.
 *
 * Fetched in parallel with the medicine itself on the detail page, which is why
 * it is a separate awaitable rather than being folded into getMedicineById.
 */
export async function getReviewsForMedicine(medicineId) {
  await wait();
  return reviewsForMedicine(medicineId);
}

/* -------------------------------------------------------------------------- */
/* Filtering and paging — pure, so they can run on the server or in a route   */
/* handler without touching the fixtures twice.                               */
/* -------------------------------------------------------------------------- */

export function filterMedicines(list, { q = "", category = "", offers = false } = {}) {
  const needle = String(q).trim().toLowerCase();

  return list.filter((medicine) => {
    if (category && medicine.category !== category) return false;

    // "Offers" is a filter over the same catalogue rather than a second one, so
    // it composes with the category and the search instead of replacing them.
    if (offers && discount(medicine) === null) return false;

    if (!needle) return true;

    // Match the brand name, the generic name and the tags — people search for
    // "paracetamol" far more often than for "Paracetamol 500".
    const haystack = [
      medicine.name,
      medicine.genericName,
      medicine.category,
      medicine.form,
      ...(medicine.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });
}

export function paginate(list, page = 1, pageSize = 6) {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: list.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

/* -------------------------------------------------------------------------- */
/* Pricing                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The markdown on a line, or null when there is not one.
 *
 * Returns the original price beside the current one, so the card prints the
 * struck-through figure from the same call that decided there was a discount at
 * all — the two numbers cannot disagree.
 *
 * There is no `percent` field any more. It existed to fill the "% OFF" pill
 * that used to sit on the card's photograph, and when that pill was removed
 * nothing read it. The struck-through price says the same thing without
 * needing a number to be computed, rounded and kept in step.
 *
 * Returning null rather than zero matters: a compareAtPrice that is not
 * actually above the price (a data-entry slip) must not render as a discount at
 * all, and a card reading "was 120, now 120" is worse than one that says
 * nothing.
 */
export function discount(medicine) {
  const now = Number(medicine?.price) || 0;
  const was = Number(medicine?.compareAtPrice) || 0;

  if (!was || !now || was <= now) return null;

  return { was, now, saving: was - now };
}

/** Everything currently marked down — drives the "Offers" strip. */
export function discountedMedicines() {
  return medicines.filter((medicine) => discount(medicine) !== null);
}

/* -------------------------------------------------------------------------- */
/* Stock                                                                      */
/* -------------------------------------------------------------------------- */

/* `stockState()` used to live here, returning a label plus a `badge--*` class
   for the card, the detail page and the dashboard table. It was superseded by
   the stock helper in app/components/StockStatus.jsx — which exists separately
   and deliberately, because that component renders inside Client Components and
   importing this module would pull the whole catalogue into the browser bundle.
   The duplication outlived its purpose, and nothing imported it. */

/** Everything at or below the reorder threshold — drives the dashboard alert. */
export function lowStockMedicines() {
  return medicines
    .filter((medicine) => medicine.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);
}

/**
 * Catalogue value at retail price. Shown on the dashboard as "stock on hand" —
 * deliberately described as retail value, not profit, because cost price is not
 * modelled yet (see FUTURE.md).
 */
export function stockValue() {
  return medicines.reduce(
    (sum, medicine) => sum + medicine.price * medicine.stock,
    0,
  );
}
