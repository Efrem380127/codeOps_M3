import MedicineCard from "./MedicineCard";
import { discount, getMedicines } from "@/lib/catalog";

/**
 * Featured medicines for the home page.
 *
 * A separate Async Server Component so the home page can wrap it in a Suspense
 * boundary: the hero and the sections below paint immediately, and this grid
 * streams in behind them.
 *
 * Selection is deterministic — reduced lines first, then highest stock, then
 * alphabetical — so the home page does not shuffle between builds.
 *
 * Reduced lines lead because this row is the storefront's shop window: a
 * saving that never appears anywhere a visitor can see it may as well not
 * exist. The sort is stable and total, so the same four items come out of
 * every build.
 */
export default async function FeaturedMedicines({ limit = 4 }) {
  const all = await getMedicines();

  const featured = [...all]
    .filter((medicine) => medicine.stock > 0)
    .sort((a, b) => {
      const aDeal = discount(a) ? 1 : 0;
      const bDeal = discount(b) ? 1 : 0;
      if (aDeal !== bDeal) return bDeal - aDeal;
      return b.stock - a.stock || a.name.localeCompare(b.name);
    })
    .slice(0, limit);

  return (
    <div className="grid">
      {featured.map((medicine) => (
        <MedicineCard key={medicine.id} medicine={medicine} />
      ))}
    </div>
  );
}
