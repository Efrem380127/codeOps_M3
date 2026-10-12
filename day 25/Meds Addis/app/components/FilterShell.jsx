"use client";

import { useId, useState } from "react";

/**
 * Filter shell — the boundary-composition example.
 *
 * `children` arrives already rendered on the server (it is <MedicineList>, an
 * Async Server Component). This wrapper only decides whether to show it. The
 * server-rendered output is therefore passed through as an opaque value, and
 * none of the list's code — the filtering, the card markup, the price
 * formatting — is pulled into the client bundle by being nested inside a Client
 * Component.
 *
 * That is the whole trick: put the directive on the leaf that needs state, not
 * on the tree that contains it.
 */
export default function FilterShell({ children, label = "medicines" }) {
  const [visible, setVisible] = useState(true);
  const panelId = useId();

  return (
    <div>
      <div className="between mb-4">
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => setVisible((value) => !value)}
          aria-expanded={visible}
          aria-controls={panelId}
        >
          {visible ? `Hide ${label}` : `Show ${label}`}
        </button>

        <span className="small muted">
          {visible ? "Results shown below." : "Results hidden."}
        </span>
      </div>

      {visible && <div id={panelId}>{children}</div>}
    </div>
  );
}
