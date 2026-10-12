import Link from "next/link";

import Icon from "@/app/components/Icon";
import EmptyState from "@/app/components/EmptyState";
import { price, when } from "@/lib/format";

/**
 * Order table for the dashboard.
 *
 * Sorting is URL-driven rather than client state, and the header cells carry
 * `aria-sort`. Two reasons this is worth the extra plumbing:
 *
 *   - A sorted table is a view someone wants to share or bookmark. State in the
 *     URL survives both; state in useState survives neither.
 *   - `aria-sort` is what tells a screen reader which column is ordered and in
 *     which direction. A visual arrow alone conveys that to sighted users only.
 *
 * The sort control is a real <Link>, so it is keyboard-reachable and appears in
 * the tab order without any JavaScript.
 */
const COLUMNS = [
  { key: "id", label: "Order", numeric: false },
  { key: "placedAt", label: "Placed", numeric: false },
  { key: "status", label: "Status", numeric: false },
  { key: "itemCount", label: "Items", numeric: true },
  { key: "total", label: "Total", numeric: true },
];

function SortHeader({ column, sort, dir, query }) {
  const isActive = sort === column.key;
  const nextDir = isActive && dir === "asc" ? "desc" : "asc";

  const params = new URLSearchParams(query);
  params.set("sort", column.key);
  params.set("dir", nextDir);

  return (
    <th
      scope="col"
      className={column.numeric ? "num" : undefined}
      aria-sort={
        isActive ? (dir === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <Link className="th-sort" href={`/dashboard?${params.toString()}`}>
        {column.label}
        {/* The sort glyph is the arrow from the icon set, not a text arrow. It
            is shown faintly while the column is sortable and at full strength
            once it is the active sort, flipped for descending. Direction is
            already announced by aria-sort on the <th>. */}
        <Icon
          name="sort"
          className="th-sort__icon"
          data-dir={isActive ? dir : "none"}
        />
      </Link>
    </th>
  );
}

export default function OrdersTable({ orders = [], sort = "placedAt", dir = "desc", query = {} }) {
  if (orders.length === 0) {
    return (
      <EmptyState icon="package" title="No orders to report">
        Nothing has been ordered in this window.
      </EmptyState>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <caption>
          All orders, sorted by {COLUMNS.find((c) => c.key === sort)?.label ?? sort}{" "}
          ({dir === "asc" ? "ascending" : "descending"}). Select a column heading
          to re-sort.
        </caption>

        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <SortHeader
                key={column.key}
                column={column}
                sort={sort}
                dir={dir}
                query={query}
              />
            ))}
            <th scope="col">
              <span className="visually-hidden">Open</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <th scope="row" style={{ fontWeight: 600 }}>
                {order.id}
              </th>
              <td>{when.format(new Date(order.placedAt))}</td>
              <td>
                <span className={`badge ${order.statusBadge}`}>
                  {order.statusLabel}
                </span>
              </td>
              <td className="num">{order.itemCount}</td>
              <td className="num">{price(order.total)}</td>
              <td>
                <Link className="btn btn--ghost btn--sm" href={`/orders/${order.id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
