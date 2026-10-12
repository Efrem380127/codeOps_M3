/**
 * Loading skeleton for the catalogue.
 *
 * Used as the Suspense fallback while <MedicineList> awaits its data. It mirrors
 * the real grid's dimensions, so the swap does not move anything on screen —
 * a skeleton that is a different size from its content makes the layout jump,
 * which is the very thing it was added to prevent.
 *
 * aria-busy + a status role means a screen reader is told the region is loading
 * rather than being read a wall of empty boxes.
 */
export default function MedicineSkeleton({ count = 6 }) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading medicines">
      <span className="visually-hidden">Loading medicines…</span>

      <div className="grid" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="med-card">
            <div className="skeleton" style={{ aspectRatio: "4 / 3" }} />
            <div className="med-card__body">
              <div className="skeleton skeleton--line" style={{ width: "70%" }} />
              <div className="skeleton skeleton--line skeleton--line-sm" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line skeleton--line-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
