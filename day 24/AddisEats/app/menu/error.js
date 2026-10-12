"use client";

import Icon from "@/app/components/Icon";

/**
 * Error boundary for /menu.
 *
 * The raw `error.message` is no longer printed. In production Next.js strips it
 * to a generic string anyway, and in development it was the only thing on the
 * page — which made a styled error state look like an unstyled one. What is
 * shown instead is a plain description plus the error `digest`, which is the
 * value that actually correlates with a server log entry.
 */
export default function Error({ error, reset }) {
  return (
    <div className="state" role="alert">
      <span className="state__icon" aria-hidden="true">
        <Icon name="alert" />
      </span>

      <h1>The menu could not be loaded</h1>

      <p className="mb-0">
        Something went wrong while fetching the dishes. Trying again often
        clears it, because the failure is usually a dropped connection rather
        than a bad request.
      </p>

      {error?.digest && (
        <p className="small muted mb-0">
          Reference: <span className="mono">{error.digest}</span>
        </p>
      )}

      <button type="button" className="btn btn-primary" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
