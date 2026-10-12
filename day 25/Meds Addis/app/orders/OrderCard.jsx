import Link from "next/link";

import { price, when } from "@/lib/format";

/**
 * One row of order history.
 *
 * A Server Component, so the status label, the money and the date formatting
 * all happen on the server and ship no JavaScript. The only client code on the
 * orders page is the cancel button on the detail page.
 *
 * The line summary is deliberately truncated to two entries plus a count. A
 * customer ordering six things does not need six lines here — the detail page
 * has them all, and a card that grows without limit makes the list unreadable.
 */
export default function OrderCard({ order, showCustomer = false }) {
  const preview = order.lines.slice(0, 2);
  const remainder = order.lines.length - preview.length;

  return (
    <article className="card">
      <div className="between">
        <div>
          <h2 className="card__title mb-0">
            <Link href={`/orders/${order.id}`}>{order.id}</Link>
          </h2>
          <p className="small muted mb-0">
            Placed {when.format(new Date(order.placedAt))}
            {showCustomer && order.contactName ? ` · ${order.contactName}` : ""}
          </p>
        </div>

        <span className={`badge ${order.statusBadge}`}>{order.statusLabel}</span>
      </div>

      <ul className="spec-list mt-4 mb-4">
        {preview.map((line) => (
          <li key={line.medicineId}>
            <span className="spec-list__k">
              {line.quantity} × {line.name}
            </span>
            <span>{price(line.lineTotal)}</span>
          </li>
        ))}

        {remainder > 0 && (
          <li>
            <span className="spec-list__k">
              + {remainder} more item{remainder === 1 ? "" : "s"}
            </span>
            <span className="muted small">
              see the order for the full list
            </span>
          </li>
        )}
      </ul>

      <div className="between">
        <span className="small muted">
          {order.itemCount} item{order.itemCount === 1 ? "" : "s"} ·{" "}
          {order.deliveryAddress}
        </span>

        <span className="cluster">
          <span className="price" style={{ fontSize: "var(--t-base)" }}>
            {price(order.total)}
          </span>
          <Link className="btn btn--outline btn--sm" href={`/orders/${order.id}`}>
            View order
          </Link>
        </span>
      </div>
    </article>
  );
}
