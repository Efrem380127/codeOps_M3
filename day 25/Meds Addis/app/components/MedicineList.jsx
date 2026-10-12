import MedicineCard from "./MedicineCard";
import EmptyState from "./EmptyState";
import { getMedicines, filterMedicines } from "@/lib/catalog";

/**
 * The catalogue grid — an Async Server Component.
 *
 * It fetches its own data, which is what lets the page stream: the shell,
 * heading and filters paint immediately while this awaits, and React fills the
 * grid in when the data resolves. None of the filtering logic, the card markup
 * or the price formatting is shipped to the browser.
 *
 * `searchParams` is passed in from the page rather than read here, so this
 * component stays a pure function of its props.
 */
export default async function MedicineList({ q = "", category = "" }) {
  const all = await getMedicines();
  const results = filterMedicines(all, { q, category });

  if (results.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="No medicines match that search"
        actionHref="/medicines"
        actionLabel="Clear filters"
      >
        Try the generic name instead of the brand — searching for
        &ldquo;amoxicillin&rdquo; finds the same medicine as
        &ldquo;Amoxil&rdquo;.
      </EmptyState>
    );
  }

  return (
    <>
      <p className="small muted mb-4" aria-live="polite">
        Showing {results.length} of {all.length} medicines
        {category ? ` in ${category}` : ""}
        {q ? ` matching “${q}”` : ""}.
      </p>

      <div className="grid">
        {results.map((medicine) => (
          <MedicineCard key={medicine.id} medicine={medicine} />
        ))}
      </div>
    </>
  );
}
