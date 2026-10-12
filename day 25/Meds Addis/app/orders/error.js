"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Error boundary scoped to /orders.
 *
 * Scoped rather than global on purpose: if the order read fails, the catalogue,
 * the cart and the rest of the site keep working. The visitor is told their
 * orders are still safe, which is the actual concern on this page.
 */
export default function OrdersError({ error, reset }) {
  useEffect(() => {
    console.error("[meds-addis] orders failed:", error);
  }, [error]);

  return (
    <main id="main" className="page container">
      <div className="state">
        <div className="state__icon" aria-hidden="true">
          !
        </div>
        <h1>We could not load your orders</h1>
        <p>
          The order list failed to render. Nothing has been cancelled or changed
          — this is a display problem, not a data one.
        </p>

        <div className="cluster">
          <button type="button" className="btn btn--primary" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn--outline" href="/medicines">
            Browse medicines
          </Link>
        </div>
      </div>
    </main>
  );
}
