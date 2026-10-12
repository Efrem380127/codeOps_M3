import MedicineSkeleton from "@/app/components/MedicineSkeleton";

/**
 * Route-level loading UI.
 *
 * Next renders this instantly while the page's server work completes, which is
 * what stops a slow catalogue from looking like a frozen tab. It is a Server
 * Component — no interactivity is needed to show a skeleton.
 */
export default function Loading() {
  return (
    <main id="main" className="page container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1>Medicines</h1>
        </div>
      </div>

      <MedicineSkeleton />
    </main>
  );
}
