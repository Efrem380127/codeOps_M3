import Link from "next/link";
import { redirect } from "next/navigation";

import FulfilmentBoard from "./FulfilmentBoard";
import ReviewQueue from "./ReviewQueue";
import Icon from "@/app/components/Icon";
import { getSession } from "@/lib/session";
import { isStaff } from "@/app/data/users";
import { getPendingPrescriptions, prescriptionCounts } from "@/lib/prescriptions";
import {
  getOrders,
  nextStatus,
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
} from "@/lib/orders";
import { price } from "@/lib/format";

export const metadata = {
  title: "Dispensary",
  description:
    "Pharmacist workspace: prescription review queue and order fulfilment.",
  robots: { index: false, follow: false },
};

/**
 * Dispensary.
 *
 * Rendering strategy: DYNAMIC, and role-gated.
 *
 * This is the second of the three protection layers, and the one that matters
 * most for a role rather than a session. Middleware already bounced a
 * signed-out visitor; this re-checks the session AND the role, because
 * middleware's matcher is a convenience that a direct request to a server
 * action never passes through at all.
 *
 * A signed-in customer who types /dispensary gets the Access Denied panel — not
 * a redirect loop, and not a peek at other patients' prescriptions.
 *
 * The statuses shown here are derived from ORDER_FLOW, so the board and the
 * server action that advances an order cannot disagree about what comes next.
 */
const BOARD_STATUSES = [
  ORDER_STATUS.VERIFIED,
  ORDER_STATUS.DISPENSING,
  ORDER_STATUS.OUT_FOR_DELIVERY,
];

export default async function DispensaryPage() {
  // This route must be dynamic: reading cookies() below makes the response
  // depend on who is asking, so it cannot be prerendered at build time.
  const user = await getSession();

  if (!user) {
    redirect("/sign-in?next=/dispensary");
  }

  if (!isStaff(user)) {
    return (
      <main id="main" className="page container">
        <div className="state">
          <div className="state__icon" aria-hidden="true">
            <Icon name="lock" />
          </div>
          <h1>Access denied</h1>
          <p>
            The dispensary is limited to pharmacists and managers. Your account
            is a customer account, so this workspace is not available to you.
          </p>
          <div className="cluster">
            <Link className="btn btn--primary" href="/medicines">
              Back to the catalogue
            </Link>
            <Link className="btn btn--outline" href="/orders">
              My orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [queue, allOrders, counts] = [
    await getPendingPrescriptions(),
    await getOrders(),
    prescriptionCounts(),
  ];

  // Only orders that can actually move. A delivered order on a work board is
  // noise, and a pending-verification order is blocked on the review queue
  // above rather than on this one.
  const board = allOrders
    .filter((order) => BOARD_STATUSES.includes(order.status))
    .map((order) => {
      const next = nextStatus(order.status);
      return {
        ...order,
        nextLabel: next ? ORDER_STATUS_LABEL[next].toLowerCase() : "delivered",
      };
    });

  const awaitingValue = allOrders
    .filter((order) => order.status === ORDER_STATUS.PENDING_VERIFICATION)
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <main id="main" className="page container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Staff workspace</span>
          <h1>Dispensary</h1>
          <p className="lede mt-2">
            Signed in as <strong>{user.name}</strong>
            {user.licenceNumber ? ` · ${user.licenceNumber}` : ""}. Nothing
            prescription-only leaves this queue without a decision.
          </p>
        </div>

        <Link className="btn btn--outline btn--sm" href="/dashboard">
          Manager dashboard
        </Link>
      </div>

      <div className="stats">
        <div className="stat">
          <p className="stat__label">Awaiting review</p>
          <p className="stat__value">{counts.pending}</p>
          <p className="stat__delta" style={{ color: "var(--ink-3)" }}>
            prescriptions in the queue
          </p>
        </div>

        <div className="stat">
          <p className="stat__label">On the board</p>
          <p className="stat__value">{board.length}</p>
          <p className="stat__delta" style={{ color: "var(--ink-3)" }}>
            orders to move today
          </p>
        </div>

        <div className="stat">
          <p className="stat__label">Held on a prescription</p>
          <p className="stat__value">{price(awaitingValue)}</p>
          <p className="stat__delta" style={{ color: "var(--ink-3)" }}>
            value waiting on verification
          </p>
        </div>

        <div className="stat">
          <p className="stat__label">Decisions recorded</p>
          <p className="stat__value">{counts.approved + counts.rejected}</p>
          <p className="stat__delta" style={{ color: "var(--ink-3)" }}>
            {counts.approved} approved · {counts.rejected} rejected
          </p>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Prescription review queue</h2>
            <p>
              Oldest first. A rejection requires a reason, because the patient
              is shown it.
            </p>
          </div>
        </div>

        <ReviewQueue prescriptions={queue} />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Fulfilment board</h2>
            <p>
              Orders that are verified and not yet delivered. Advancing attaches
              a courier at dispatch, which is what the tracking map reads.
            </p>
          </div>
        </div>

        <FulfilmentBoard orders={board} />
      </section>
    </main>
  );
}
