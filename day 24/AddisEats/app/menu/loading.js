/**
 * Loading state for /menu.
 *
 * Was two lines of prose — "Loading menu..." and "Please wait while the menu is
 * loading." — which tells the visitor what they can already see and then pushes
 * the real content down the page when it arrives.
 *
 * This mirrors the finished grid instead, using the same `.food-card`
 * dimensions, so the swap does not move anything on screen. `role="status"` and
 * `aria-busy` mean a screen reader is told the region is loading rather than
 * being read a wall of empty boxes.
 */
export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading the menu">
      <span className="sr-only">Loading the menu&hellip;</span>

      <div className="section-head">
        <div>
          <span className="section-index">Menu</span>
          <div
            className="skeleton skeleton--line"
            style={{ width: "8rem", height: "2rem" }}
          />
        </div>
      </div>

      <div className="filters" aria-hidden="true">
        {[84, 76, 80, 68].map((width, index) => (
          <span key={index} className="chip" style={{ width, opacity: 0.5 }}>
            &nbsp;
          </span>
        ))}
      </div>

      <div className="menu-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="food-card">
            <div className="food-card-media skeleton" />
            <div className="food-card-body">
              <div className="skeleton skeleton--line" style={{ width: "62%" }} />
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
