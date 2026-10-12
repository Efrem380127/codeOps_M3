"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Global error boundary.
 *
 * Two things a boundary must do that are easy to forget:
 *
 *  1. `reset()` re-renders the segment, which is what makes "Try again" work
 *     without a full page reload.
 *  2. The error is logged once, in an effect — logging during render runs on
 *     every re-render and floods the console.
 *
 * It must be a Client Component: React only supports error boundaries in
 * client code.
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[meds-addis] unhandled error:", error);
  }, [error]);

  return (
    <main id="main" className="page container">
      <div className="state">
        <div className="state__icon" aria-hidden="true">
          !
        </div>
        <h1>Something went wrong</h1>
        <p>
          This part of the application failed to render. Nothing in your cart or
          your orders has been changed.
        </p>

        {error?.digest && (
          <p className="small muted">
            Reference <span className="mono">{error.digest}</span> — quote this if
            you report the problem.
          </p>
        )}

        <div className="cluster">
          <button type="button" className="btn btn--primary" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn--outline" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
