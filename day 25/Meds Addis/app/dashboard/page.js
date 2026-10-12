import Link from "next/link";
import { redirect } from "next/navigation";

import DownloadCsvButton from "./DownloadCsvButton";
import OrdersChart from "./OrdersChart";
import RevenueChart from "./RevenueChart";
import OrdersTable from "./OrdersTable";
import StockTable from "./StockTable";
import { OrdersTimeTable, RevenueTable } from "./ChartTables";
import Icon from "@/app/components/Icon";
import { getSession } from "@/lib/session";
import { ROLES } from "@/app/data/users";
import { medicines } from "@/app/data/medicines";
import { prescriptionCounts } from "@/lib/prescriptions";
import {
  getOrders,
  orderSummary,
  ordersByDay,
  revenueByCategory,
} from "@/lib/orders";
import { lowStockMedicines, stockValue, LOW_STOCK_THRESHOLD } from "@/lib/catalog";
import { price, number, percent } from "@/lib/format";

export const metadata = {
  title: "Manager dashboard",
  description:
    "Revenue, order volume, stock levels and prescription throughput for Meds Addis.",
  robots: { index: false, follow: false },
};

/**
 * Manager dashboard.
 *
 * Rendering strategy: DYNAMIC, manager-only.
 *
 * The role check is here rather than in the middleware matcher for the reason
 * the middleware comment already gives: middleware is a convenience, and this is
 * the control. A pharmacist can work the dispensary but not open the books.
 *
 * Every number on this page is derived in lib/orders.js and lib/catalog.js
 * rather than computed inline, so the dashboard, the CSV export and the
 * dispensary board cannot disagree about what an order was worth.
 */

const SORTABLE = {
  id: (order) => order.id,
  placedAt: (order) => order.placedAt,
  status: (order) => order.status,
  itemCount: (order) => order.itemCount,
  total: (order) => order.total,
};

export default async function DashboardPage({ searchParams }) {
  // This route must be dynamic: reading cookies() below makes the response
  // depend on who is asking, so it cannot be prerendered at build time.
  const user = await getSession();

  if (!user) {
    redirect("/sign-in?next=/dashboard");
  }

  if (user.role !== ROLES.MANAGER) {
    return (
      <main id="main" className="page container">
        <div className="state">
          <div className="state__icon" aria-hidden="true">
            <Icon name="lock" />
          </div>
          <h1>Access denied</h1>
          <p>
            The dashboard carries commercial figures and is limited to manager
            accounts. Your account role is <strong>{user.role}</strong>.
          </p>
          <div className="cluster">
            {user.role === ROLES.PHARMACIST && (
              <Link className="btn btn--primary" href="/dispensary">
                Go to the dispensary
              </Link>
            )}
            <Link className="btn btn--outline" href="/medicines">
              Back to the catalogue
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { sort = "placedAt", dir = "desc" } = await searchParams;

  const orders = await getOrders();
  const summary = orderSummary();
  const rx = prescriptionCounts();

  const sorter = SORTABLE[sort] ?? SORTABLE.placedAt;
  const direction = dir === "asc" ? 1 : -1;

  const sortedOrders = [...orders].sort((a, b) => {
    const left = sorter(a);
    const right = sorter(b);
    if (left === right) return 0;
    return left > right ? direction : -direction;
  });

  const low = lowStockMedicines();
  const lowFirst = [...medicines].sort((a, b) => a.stock - b.stock);

  return (
    <main id="main" className="page container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Manager</span>
          <h1>Dashboard</h1>
          <p className="lede mt-2">
            Signed in as <strong>{user.name}</strong>. Figures are derived from
            the order fixtures at request time, so nothing here is a stored total
            that can drift.
          </p>
        </div>

        <DownloadCsvButton orders={orders} stock={lowFirst} />
      </div>

      <section className="stats" aria-label="Headline figures">
        <div className="stat">
          <p className="stat__label">Revenue</p>
          <p className="stat__value">{price(summary.revenue)}</p>
          <p className="stat__delta" style={{ color: "var(--ink-3)" }}>
            {summary.orderCount} orders, cancellations excluded
          </p>
        </div>

        <div className="stat">
          <p className="stat__label">Average order</p>
          <p className="stat__value">{price(summary.averageOrderValue)}</p>
          <p className="stat__delta" style={{ color: "var(--ink-3)" }}>
            across {summary.orderCount} completed orders
          </p>
        </div>

        <div className="stat">
          <p className="stat__label">Awaiting pharmacist</p>
          <p className="stat__value">{summary.awaitingVerification}</p>
          <p className="stat__delta" style={{ color: "var(--ink-3)" }}>
            {rx.pending} prescription{rx.pending === 1 ? "" : "s"} in the queue
          </p>
        </div>

        <div className="stat">
          <p className="stat__label">Stock on hand</p>
          <p className="stat__value">{price(stockValue())}</p>
          <p className="stat__delta" style={{ color: "var(--ink-3)" }}>
            retail value across {number.format(medicines.length)} lines
          </p>
        </div>

        <div className="stat">
          <p className="stat__label">Reorder alerts</p>
          <p className="stat__value">{low.length}</p>
          <p className="stat__delta" style={{ color: "var(--ink-3)" }}>
            at or below {LOW_STOCK_THRESHOLD} units
          </p>
        </div>

        <div className="stat">
          <p className="stat__label">In transit</p>
          <p className="stat__value">{summary.inTransit}</p>
          <p className="stat__delta" style={{ color: "var(--ink-3)" }}>
            {summary.cancelled} cancelled all time
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Revenue by category</h2>
            <p>
              Which therapeutic areas actually earn. The table beneath the chart
              carries the same numbers for screen readers and print.
            </p>
          </div>
        </div>

        <div className="chart-grid">
          <RevenueChart data={revenueByCategory()} />
          <OrdersChart data={ordersByDay()} />
        </div>

        <div className="chart-grid mt-4">
          <RevenueTable data={revenueByCategory()} />
          <OrdersTimeTable data={ordersByDay()} />
        </div>
      </section>

      {low.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Reorder soon</h2>
              <p>
                {low.length} line{low.length === 1 ? "" : "s"} at or below the
                reorder point. A prescription-only line running out is an
                access problem, not just a sales one.
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <caption>Medicines at or below the reorder point</caption>
              <thead>
                <tr>
                  <th scope="col">Medicine</th>
                  <th scope="col">Category</th>
                  <th scope="col" className="num">
                    Stock
                  </th>
                  <th scope="col">Supply</th>
                </tr>
              </thead>
              <tbody>
                {low.map((medicine) => (
                  <tr key={medicine.id}>
                    <th scope="row" style={{ fontWeight: 600 }}>
                      <Link href={`/medicines/${medicine.id}`}>
                        {medicine.name}
                      </Link>
                    </th>
                    <td>{medicine.category}</td>
                    <td className="num">{medicine.stock}</td>
                    <td>
                      {medicine.requiresPrescription ? (
                        <span className="badge badge--rx">
                          <Icon name="capsule" /> controlled
                        </span>
                      ) : (
                        <span className="badge badge--neutral">Open shelf</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Orders</h2>
            <p>
              Select any column heading to sort. The sorted view is a URL, so it
              can be bookmarked and shared.
            </p>
          </div>
        </div>

        <OrdersTable
          orders={sortedOrders}
          sort={sort}
          dir={dir}
          query={{ sort, dir }}
        />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Stock on hand</h2>
            <p>
              Lowest first, so the lines that need a purchase order are at the
              top rather than buried.
            </p>
          </div>
        </div>

        <StockTable medicines={lowFirst} threshold={LOW_STOCK_THRESHOLD} />
      </section>

      <p className="small muted">
        Prescription throughput: {rx.approved} approved, {rx.rejected} rejected,{" "}
        {rx.pending} pending —{" "}
        {rx.approved + rx.rejected === 0
          ? "no decisions recorded yet."
          : `${percent(
              (rx.approved / (rx.approved + rx.rejected)) * 100,
            )} of decisions were approvals.`}
      </p>
    </main>
  );
}
