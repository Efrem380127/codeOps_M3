import Link from "next/link";

import { orders } from "@/app/data/orders";
import LiveOrderStatus from "./LiveOrderStatus";

export const metadata = {
  title: "Live Order Status & Delivery Map",
  description:
    "Track real-time courier movement, SSE connection indicators, and delivery progress for your Addis Eats orders.",
  alternates: { canonical: "/order-status" }
};

export default async function OrderStatusPage({ searchParams }) {
  const params = await searchParams;
  const requested = typeof params?.id === "string" ? params.id : "";

  const initialOrder =
    orders.find((order) => String(order.id) === String(requested)) || orders[0];

  const wasNotFound = Boolean(requested) && initialOrder.id !== requested;

  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/orders">Orders</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{initialOrder.id}</span>
      </nav>

      {/*
        A note rather than a silent substitution. The previous version fell back
        to the first order with no indication, so a mistyped id looked like it
        had simply loaded someone else's order.
      */}
      {wasNotFound && (
        <p className="small muted">
          No order matches <span className="mono">{requested}</span>, so the most
          recent one is shown instead.
        </p>
      )}

      <LiveOrderStatus initialOrder={initialOrder} />

      {orders.length > 1 && (
        <section className="section">
          <div className="section-head">
            <div>
              <span className="section-index">Switch</span>
              <h2>Other orders</h2>
            </div>
            <p className="small muted mb-0">
              Each one streams independently, so opening a second tab shows that
              order&rsquo;s courier rather than this one&rsquo;s.
            </p>
          </div>

          <nav className="filters" aria-label="Switch order">
            {orders.map((order) => (
              <Link
                key={order.id}
                className="chip"
                href={`/order-status?id=${encodeURIComponent(order.id)}`}
                data-active={order.id === initialOrder.id ? "true" : "false"}
                aria-current={order.id === initialOrder.id ? "true" : undefined}
              >
                {order.id}
              </Link>
            ))}
          </nav>
        </section>
      )}
    </>
  );
}
