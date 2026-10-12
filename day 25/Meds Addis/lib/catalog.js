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

export function filterMedicines(list, { q = "", category = "" } = {}) {
  const needle = String(q).trim().toLowerCase();

  return list.filter((medicine) => {
    if (category && medicine.category !== category) return false;

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
/* Stock                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Turns a raw stock count into something the UI can render consistently.
 * Used by the card badge, the detail page and the dashboard stock table, so the
 * thresholds are defined exactly once.
 */
export function stockState(medicine) {
  const stock = Number(medicine?.stock) || 0;

  if (stock === 0) {
    return {
      key: "out",
      label: "Out of stock",
      badge: "badge--out",
      purchasable: false,
    };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      key: "low",
      label: `Only ${stock} left`,
      badge: "badge--low",
      purchasable: true,
    };
  }

  return {
    key: "ok",
    label: "In stock",
    badge: "badge--ok",
    purchasable: true,
  };
}

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
