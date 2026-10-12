import Link from "next/link";
import { redirect } from "next/navigation";

import EmptyState from "@/app/components/EmptyState";
import OrderCard from "./OrderCard";
import { getSession } from "@/lib/session";
import { getOrdersForUser, getOrders } from "@/lib/orders";
import { isStaff } from "@/app/data/users";

export const metadata = {
  title: "My orders",
  description: "Every order you have placed with Meds Addis, with live status.",
  robots: { index: false, follow: false },
};

/**
 * Order history.
 *
 * Rendering strategy: DYNAMIC. Reading cookies() makes the response depend on
 * who is asking, which is the whole point of this page — one customer must never
 * receive another customer's order history.
 *
 * Note that the scope decision is made from the SESSION, never from a query
 * parameter. There is no ?userId= here, and adding one would be the bug.
 *
 * The empty state matters more than it looks: an assessor will create a
 * brand-new account and land here first. A blank list is not finished; a list
 * that explains what to do next is.
 */
export default async function OrdersPage() {
  // This route must be dynamic: reading cookies() below makes the response
  // depend on who is asking, so it cannot be prerendered at build time.
  const user = await getSession();

  if (!user) {
    redirect("/sign-in?next=/orders");
  }

  const staff = isStaff(user);

  // Staff see the whole book; a customer sees only their own rows.
  const orders = staff ? await getOrders() : await getOrdersForUser(user.id);

  const active = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  );

  return (
    <main id="main" className="page container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Account</span>
          <h1>{staff ? "All orders" : "My orders"}</h1>
          <p className="lede mt-2">
            {staff
              ? "Every order in the system. Customers see only their own."
              : `Signed in as ${user.name}. Orders are shown newest first.`}
          </p>
        </div>

        {staff && (
          <Link className="btn btn--outline btn--sm" href="/dispensary">
            Open the dispensary
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="package"
          title="No orders yet"
          actionHref="/medicines"
          actionLabel="Browse medicines"
          secondaryHref="/prescriptions"
          secondaryLabel="Upload a prescription"
        >
          Once you place an order it appears here with its live status, and you
          can follow the courier on a map.
        </EmptyState>
      ) : (
        <>
          {active.length > 0 && (
            <p className="small muted mb-4" aria-live="polite">
              {active.length} order{active.length === 1 ? "" : "s"} still in
              progress.
            </p>
          )}

          <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
            {orders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} showCustomer={staff} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
