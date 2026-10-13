import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import LiveTracker from "./LiveTracker";
import Icon from "@/app/components/Icon";
import { getSession } from "@/lib/session";
import { getOrderById } from "@/lib/orders";
import { isStaff } from "@/app/data/users";
import { price, when, timeAgo } from "@/lib/format";

export const metadata = {
  title: "Track an order",
  description: "Follow your Meds Addis courier live on the map.",
  robots: { index: false, follow: false },
};

/**
 * Track an order.
 *
 * Rendering strategy: DYNAMIC. The order is scoped to one account, so this
 * cannot be prerendered and must not be cached.
 *
 * The map itself is a Client Component loaded with `ssr: false` (see
 * LiveTracker), which keeps Leaflet — a substantial library — out of the server
 * render and out of the first-load JavaScript for every other route.
 */
export default async function TrackOrderPage({ params }) {
  // This route must be dynamic: reading cookies() below makes the response
  // depend on who is asking, so it cannot be prerendered at build time.
  const user = await getSession();

  if (!user) {
    const { id } = await params;
    redirect(`/sign-in?next=/track/${id}`);
  }

  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  // Same ownership rule as everywhere else: an id in a URL is not a capability.
  if (order.userId !== user.id && !isStaff(user)) {
    return (
      <main id="main" className="page container">
        <div className="state">
          <div className="state__icon" aria-hidden="true">
            <Icon name="lock" />
          </div>
          <h1>Access denied</h1>
          <p>This delivery belongs to a different account.</p>
          <Link className="btn btn--primary" href="/orders">
            Back to my orders
          </Link>
        </div>
      </main>
    );
  }

  // The map reads these two points; the courier block only exists once dispatched.
  const delivery = {
    lat: 9.0125,
    lng: 38.775,
    address: order.deliveryAddress,
  };

  return (
    <main id="main" className="page container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Tracking</span>
          <h1>Order {order.id}</h1>
          <p className="lede mt-2">
            <span className={`status ${order.statusTone}`}>
              {order.statusLabel}
            </span>{" "}
            · placed {when.format(new Date(order.placedAt))}
          </p>
        </div>

        <Link className="btn btn--outline" href={`/orders/${order.id}`}>
          Order details
        </Link>
      </div>

      <div className="detail">
        <section aria-label="Delivery map">
          <LiveTracker
            orderId={order.id}
            courier={order.courier}
            delivery={delivery}
            status={order.status}
          />

          {/*
            A text equivalent for the map. Not a fallback — it is the accessible
            version of the same information, and it is also what a screen reader
            user gets instead of an <svg> of tiles.
          */}
          <div className="card mt-4">
            <h2 className="card__title">Where your order is</h2>

            <ul className="spec-list mt-4">
              <li>
                <span className="spec-list__k">Status</span>
                <span>{order.statusLabel}</span>
              </li>
              <li>
                <span className="spec-list__k">Dispatching branch</span>
                <span>Meds Addis — Bole, Addis Ababa</span>
              </li>
              <li>
                <span className="spec-list__k">Delivery address</span>
                <span>{order.deliveryAddress}</span>
              </li>
              <li>
                <span className="spec-list__k">Items</span>
                <span>
                  {order.itemCount} · {price(order.total)} on delivery
                </span>
              </li>
              {order.courier && (
                <>
                  <li>
                    <span className="spec-list__k">Courier</span>
                    <span>
                      {order.courier.name} · {order.courier.vehicle}
                    </span>
                  </li>
                  <li>
                    <span className="spec-list__k">Contact</span>
                    <span>{order.courier.phone}</span>
                  </li>
                  <li>
                    <span className="spec-list__k">Last ping</span>
                    <span>{timeAgo(order.courier.updatedAt)}</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </section>

        <aside className="stack" aria-label="Delivery notes">
          <section className="card">
            <h2 className="card__title">Delivery notes</h2>
            <p className="mt-2 mb-0">
              {order.note || "No note was left for the courier on this order."}
            </p>
          </section>

          <section className="card">
            <h2 className="card__title">Cold-chain items</h2>
            <p className="small muted mb-0">
              Nothing in this order requires refrigeration. Items that do are
              carried in an insulated box and handed over in person, never left
              with a guard.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
