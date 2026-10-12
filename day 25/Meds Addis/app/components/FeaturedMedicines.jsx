import MedicineCard from "./MedicineCard";
import { getMedicines } from "@/lib/catalog";

/**
 * Featured medicines for the home page.
 *
 * A separate Async Server Component so the home page can wrap it in a Suspense
 * boundary: the hero and the sections below paint immediately, and this grid
 * streams in behind them.
 *
 * Selection is deterministic — highest stock, then alphabetical — so the home
 * page does not shuffle between builds.
 */
export default async function FeaturedMedicines({ limit = 4 }) {
  const all = await getMedicines();

  const featured = [...all]
    .filter((medicine) => medicine.stock > 0)
    .sort((a, b) => b.stock - a.stock || a.name.localeCompare(b.name))
    .slice(0, limit);

  return (
    <div className="grid">
      {featured.map((medicine) => (
        <MedicineCard key={medicine.id} medicine={medicine} />
      ))}
    </div>
  );
}
