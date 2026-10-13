"use client";

import { useId, useState } from "react";

import Icon from "./Icon";

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
 *
 * Presentation note: this used to be a bordered control on its own full-width
 * row, with the toggle at the left edge and "Results shown below." pushed to
 * the right edge. It cost a band of vertical space and read as chrome the page
 * did not need — a disclosure control for content that is already on screen.
 * It is now a single quiet text line: the chevron carries the state visually,
 * the label carries it in words, and nothing stretches across the page.
 */
export default function FilterShell({ children, label = "medicines" }) {
  const [visible, setVisible] = useState(true);
  const panelId = useId();

  return (
    <div>
      <div className="filter-shell">
        <button
          type="button"
          className="filter-shell__toggle"
          onClick={() => setVisible((value) => !value)}
          aria-expanded={visible}
          aria-controls={panelId}
        >
          {/* One chevron, rotated by CSS: pointing down when the results are
              open, right when they are collapsed. A second icon path would be
              a second thing to keep in sync. */}
          <Icon
            name="chevronRight"
            className="filter-shell__chevron"
            data-open={visible}
          />
          {visible ? `Hide ${label}` : `Show ${label}`}
        </button>

        <span className="filter-shell__note">
          {visible ? "Results below" : "Results hidden"}
        </span>
      </div>

      {visible && <div id={panelId}>{children}</div>}
    </div>
  );
}
