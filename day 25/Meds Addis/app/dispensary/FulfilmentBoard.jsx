"use client";

import Link from "next/link";
import { useActionState } from "react";

import { advanceOrder } from "@/app/actions/order";
import Icon from "@/app/components/Icon";
import { price, timeAgo } from "@/lib/format";

/**
 * One order in the fulfilment board.
 *
 * The "advance" action is a ROLE check, not an ownership check — staff are
 * moving someone else's order, so "is the caller the owner?" is the wrong
 * question. That distinction is the reason lib/orders.js and the actions keep
 * the two checks separate rather than reusing one helper.
 */
function FulfilmentCard({ order, nextLabel }) {
  const [state, formAction, isPending] = useActionState(advanceOrder, null);

  return (
    <li className="card">
      <div className="between">
        <div>
          <h3 className="card__title mb-0">
            <Link href={`/orders/${order.id}`}>{order.id}</Link>
          </h3>
          <p className="small muted mb-0">
            {order.contactName ?? "—"} · {timeAgo(order.placedAt)} ·{" "}
            {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
          </p>
        </div>

        <span className={`badge ${order.statusBadge}`}>{order.statusLabel}</span>
      </div>

      <ul className="spec-list mt-4">
        {order.lines.map((line) => (
          <li key={line.medicineId}>
            <span className="spec-list__k">
              {line.quantity} × {line.name} {line.strength}
            </span>
            <span>
              {line.requiresPrescription ? <Icon name="capsule" /> : "—"}
            </span>
          </li>
        ))}
        <li>
          <span className="spec-list__k">Deliver to</span>
          <span>{order.deliveryAddress}</span>
        </li>
        <li>
          <span className="spec-list__k">Total</span>
          <span>{price(order.total)}</span>
        </li>
      </ul>

      {state?.error && (
        <div className="alert alert--error mt-4" role="alert">
          <div>
            <p className="alert__title">Could not advance</p>
            <p className="mb-0">{state.error}</p>
          </div>
        </div>
      )}

      {state?.ok && (
        <div className="alert alert--ok mt-4" role="status">
          <p className="mb-0">{state.message}</p>
        </div>
      )}

      <form className="mt-4" action={formAction}>
        <input type="hidden" name="orderId" value={order.id} />

        <button
          type="submit"
          className="btn btn--primary btn--sm"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? "Updating…" : `Mark as ${nextLabel}`}
        </button>
      </form>
    </li>
  );
}

/**
 * The fulfilment board.
 *
 * Only orders that can actually move are listed. A board that shows delivered
 * orders is a board nobody reads.
 *
 * `nextLabel` is passed down from the server so the button text comes from the
 * same ORDER_FLOW the action uses — the label and the transition cannot drift.
 */
export default function FulfilmentBoard({ orders = [] }) {
  if (orders.length === 0) {
    return (
      <div className="state">
        <div className="state__icon" aria-hidden="true">
          <Icon name="check" />
        </div>
        <h3>No orders waiting</h3>
        <p>
          Every order is either delivered, cancelled, or held pending a
          prescription review.
        </p>
      </div>
    );
  }

  return (
    <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
      {orders.map((order) => (
        <FulfilmentCard key={order.id} order={order} nextLabel={order.nextLabel} />
      ))}
    </ul>
  );
}
