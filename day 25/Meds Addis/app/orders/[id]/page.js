import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import CancelOrderForm from "../CancelOrderForm";
import LiveOrderStatus from "../LiveOrderStatus";
import OrderTimeline from "../OrderTimeline";
import Icon from "@/app/components/Icon";
import { getSession } from "@/lib/session";
import { getOrderById } from "@/lib/orders";
import { findPrescription } from "@/app/data/prescriptions";
import { isStaff } from "@/app/data/users";
import { price, priceExact, when } from "@/lib/format";

/**
 * Order detail.
 *
 * Rendering strategy: DYNAMIC. It reads cookies() and it is scoped to one
 * account, so it cannot be prerendered and must not be cached.
 *
 * This page is the fourth place the ownership rule appears (middleware, the
 * order list, the API route, and here) and the redundancy is the point. The
 * check that matters is the one on the server that produces the 403 — an id in
 * a URL is not a capability.
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Order ${id}`,
    description: `Status, items and delivery details for order ${id}.`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderDetailPage({ params, searchParams }) {
  // This route must be dynamic: reading cookies() below makes the response
  // depend on who is asking, so it cannot be prerendered at build time.
  const user = await getSession();

  if (!user) {
    const { id } = await params;
    redirect(`/sign-in?next=/orders/${id}`);
  }

  const { id } = await params;
  const { placed } = await searchParams;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  /*
   * The refusal. A signed-in customer who changes the id in the URL gets an
   * explicit gate rather than someone else's address and order contents.
   * Staff may open any order — that is the job.
   */
  if (order.userId !== user.id && !isStaff(user)) {
    return (
      <main id="main" className="page container">
        <div className="state">
          <div className="state__icon" aria-hidden="true">
            <Icon name="lock" />
          </div>
          <h1>Access denied</h1>
          <p>
            This order belongs to a different account. If you reached this link
            from somewhere else, it is not yours to open.
          </p>
          <div className="cluster">
            <Link className="btn btn--primary" href="/orders">
              Back to my orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const prescription = order.prescriptionId
    ? findPrescription(order.prescriptionId)
    : null;

  return (
    <main id="main" className="page container">
      {placed === "1" && (
        <div className="alert alert--ok mb-6" role="status">
          <div>
            <p className="alert__title">Order placed</p>
            <p className="mb-0">
              {order.status === "pending_verification"
                ? "A pharmacist will verify the attached prescription before it is dispensed. You will see the status change here."
                : "Your order is confirmed and the dispensary has it. You can follow it from this page."}
            </p>
          </div>
        </div>
      )}

      <div className="section-head">
        <div>
          <span className="eyebrow">Order</span>
          <h1>{order.id}</h1>
          <p className="lede mt-2">
            Placed {when.format(new Date(order.placedAt))} ·{" "}
            <span className={`badge ${order.statusBadge}`}>
              {order.statusLabel}
            </span>
          </p>
        </div>

        <div className="cluster">
          {order.status === "out_for_delivery" && (
            <Link className="btn btn--primary" href={`/track/${order.id}`}>
              Track the courier
            </Link>
          )}
          <Link className="btn btn--outline" href="/orders">
            All orders
          </Link>
        </div>
      </div>

      <div className="detail">
        <div className="stack">
          <section className="card">
            <h2 className="card__title">Progress</h2>
            <div className="mt-4">
              <OrderTimeline order={order} />
            </div>
          </section>

          <section aria-label="Items in this order">
            <h2 className="mb-4">Items</h2>

            <div className="table-wrap">
              <table className="table">
                <caption>
                  Medicines in order {order.id}, with the price each line
                  contributes
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Medicine</th>
                    <th scope="col">Qty</th>
                    <th scope="col" className="num">
                      Unit
                    </th>
                    <th scope="col" className="num">
                      Line total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map((line) => (
                    <tr key={line.medicineId}>
                      <td>
                        {line.missing ? (
                          <span>
                            {line.name}{" "}
                            <span className="badge badge--out">Unavailable</span>
                          </span>
                        ) : (
                          <Link href={`/medicines/${line.medicineId}`}>
                            {line.name}
                          </Link>
                        )}
                        <br />
                        <span className="small muted">
                          {line.strength} · {line.form}
                          {line.requiresPrescription && " · Rx"}
                        </span>
                      </td>
                      <td>{line.quantity}</td>
                      <td className="num">{price(line.unitPrice)}</td>
                      <td className="num">{price(line.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan={3}>
                      Subtotal
                    </th>
                    <td className="num">{priceExact(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <th scope="row" colSpan={3}>
                      Delivery
                    </th>
                    <td className="num">
                      {order.deliveryFee === 0 ? "Free" : priceExact(order.deliveryFee)}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" colSpan={3}>
                      Total due on delivery
                    </th>
                    <td className="num">
                      <strong>{priceExact(order.total)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>

        <aside className="stack" aria-label="Order details">
          <LiveOrderStatus orderId={order.id} initialOrder={order} />

          <section className="card">
            <h2 className="card__title">Delivery</h2>

            <ul className="spec-list mt-4">
              <li>
                <span className="spec-list__k">Address</span>
                <span>{order.deliveryAddress}</span>
              </li>
              {order.contactName && (
                <li>
                  <span className="spec-list__k">Contact</span>
                  <span>
                    {order.contactName}
                    {order.contactPhone ? ` · ${order.contactPhone}` : ""}
                  </span>
                </li>
              )}
              {order.note && (
                <li>
                  <span className="spec-list__k">Note</span>
                  <span>{order.note}</span>
                </li>
              )}
              <li>
                <span className="spec-list__k">Payment</span>
                <span>Cash on delivery</span>
              </li>
            </ul>
          </section>

          {prescription && (
            <section className="card">
              <h2 className="card__title">Prescription</h2>

              <ul className="spec-list mt-4">
                <li>
                  <span className="spec-list__k">Reference</span>
                  <span>{prescription.id}</span>
                </li>
                <li>
                  <span className="spec-list__k">Prescriber</span>
                  <span>
                    {prescription.prescriberName} ({prescription.prescriberLicence})
                  </span>
                </li>
                <li>
                  <span className="spec-list__k">Facility</span>
                  <span>{prescription.facility}</span>
                </li>
                <li>
                  <span className="spec-list__k">Status</span>
                  <span className={`badge ${
                    prescription.status === "approved"
                      ? "badge--ok"
                      : prescription.status === "rejected"
                        ? "badge--out"
                        : "badge--rx"
                  }`}>
                    {prescription.status}
                  </span>
                </li>
              </ul>

              <Link
                className="btn btn--outline btn--sm mt-4"
                href="/prescriptions"
              >
                Manage prescriptions
              </Link>
            </section>
          )}

          {order.isCancellable && (
            <section className="card">
              <h2 className="card__title">Cancel</h2>
              <div className="mt-2">
                <CancelOrderForm orderId={order.id} />
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
