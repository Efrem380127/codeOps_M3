/**
 * Route-level loading UI for the order list.
 *
 * Rendered instantly while getOrdersForUser() awaits, so a slow read does not
 * look like a frozen tab. Shaped like the real list — card, two lines, a badge —
 * so the swap does not move anything.
 */
export default function LoadingOrders() {
  return (
    <main id="main" className="page container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Account</span>
          <h1>My orders</h1>
        </div>
      </div>

      <div role="status" aria-busy="true">
        <span className="visually-hidden">Loading your orders…</span>

        <ul className="stack" style={{ listStyle: "none", padding: 0 }} aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="card">
              <div className="between">
                <div className="skeleton skeleton--line" style={{ width: "12rem" }} />
                <div className="skeleton skeleton--line" style={{ width: "6rem" }} />
              </div>
              <div className="skeleton skeleton--line mt-4" />
              <div className="skeleton skeleton--line skeleton--line-sm" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
