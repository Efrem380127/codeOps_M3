"use client";

import { useEffect } from "react";

/**
 * Catalogue error boundary.
 *
 * Scoped to /medicines rather than the whole app, so a failure here leaves the
 * header, the cart and the rest of the site working. The message deliberately
 * avoids showing the raw error to the visitor while still logging it.
 */
export default function MedicinesError({ error, reset }) {
  useEffect(() => {
    console.error("[meds-addis] catalogue failed:", error);
  }, [error]);

  return (
    <main id="main" className="page container">
      <div className="state">
        <div className="state__icon" aria-hidden="true">
          !
        </div>
        <h1>The catalogue did not load</h1>
        <p>
          Something went wrong fetching the medicine list. Your cart has not been
          affected.
        </p>
        <button type="button" className="btn btn--primary" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
