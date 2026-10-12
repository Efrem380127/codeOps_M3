import Link from "next/link";
import { etb, when } from "@/lib/format";
import CsvExportButton from "./CsvExportButton";
import Icon from "@/app/components/Icon";

export default function OrderTable({
  orders = [],
  allOrders = [],
  totalCount = 0,
  currentPage = 1,
  pageSize = 5,
  sortKey = "date",
  sortDir = "desc",
  stateParam = null
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  function createSortHref(targetKey) {
    const nextDir = sortKey === targetKey && sortDir === "asc" ? "desc" : "asc";
    const params = new URLSearchParams();
    params.set("sort", targetKey);
    params.set("dir", nextDir);
    params.set("page", "1");
    if (stateParam) {
      params.set("state", stateParam);
    }
    return `/orders?${params.toString()}`;
  }

  function createPageHref(targetPage) {
    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    params.set("sort", sortKey);
    params.set("dir", sortDir);
    if (stateParam) {
      params.set("state", stateParam);
    }
    return `/orders?${params.toString()}`;
  }

  function getAriaSort(columnKey) {
    if (sortKey !== columnKey) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  }

  function renderSortIndicator(columnKey) {
    if (sortKey !== columnKey) {
      return (
        <span aria-hidden="true" style={{ color: "var(--ink-3)", marginLeft: "4px" }}>
          &#x21C5;
        </span>
      );
    }
    return (
      <span aria-hidden="true" style={{ color: "var(--ink-0)", marginLeft: "4px" }}>
        {sortDir === "asc" ? "\u25B2" : "\u25BC"}
      </span>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r)",
        padding: "1.25rem",
        marginTop: "1.5rem"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "var(--ink-0)", margin: 0 }}>
          Customer Orders Log
        </h2>
        <CsvExportButton orders={allOrders.length > 0 ? allOrders : orders} />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
            color: "var(--ink-0)"
          }}
        >
          <caption
            style={{
              captionSide: "top",
              textAlign: "left",
              fontWeight: "600",
              fontSize: "0.875rem",
              color: "var(--ink-2)",
              marginBottom: "0.5rem"
            }}
          >
            Customer Orders and Fulfillment Details
          </caption>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--rule)", backgroundColor: "var(--surface-sunken)" }}>
              <th
                scope="col"
                style={{
                  textAlign: "left",
                  padding: "0.75rem 0.875rem",
                  fontWeight: "600",
                  color: "var(--ink-0)"
                }}
              >
                Order ID
              </th>
              <th
                scope="col"
                aria-sort={getAriaSort("date")}
                style={{
                  textAlign: "left",
                  padding: "0.75rem 0.875rem",
                  fontWeight: "600",
                  color: "var(--ink-0)"
                }}
              >
                <Link
                  href={createSortHref("date")}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "44px"
                  }}
                >
                  Date
                  {renderSortIndicator("date")}
                </Link>
              </th>
              <th
                scope="col"
                aria-sort={getAriaSort("name")}
                style={{
                  textAlign: "left",
                  padding: "0.75rem 0.875rem",
                  fontWeight: "600",
                  color: "var(--ink-0)"
                }}
              >
                <Link
                  href={createSortHref("name")}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "44px"
                  }}
                >
                  Customer
                  {renderSortIndicator("name")}
                </Link>
              </th>
              <th
                scope="col"
                style={{
                  textAlign: "left",
                  padding: "0.75rem 0.875rem",
                  fontWeight: "600",
                  color: "var(--ink-0)"
                }}
              >
                Area
              </th>
              <th
                scope="col"
                aria-sort={getAriaSort("status")}
                style={{
                  textAlign: "left",
                  padding: "0.75rem 0.875rem",
                  fontWeight: "600",
                  color: "var(--ink-0)"
                }}
              >
                <Link
                  href={createSortHref("status")}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "44px"
                  }}
                >
                  Status
                  {renderSortIndicator("status")}
                </Link>
              </th>
              <th
                scope="col"
                style={{
                  textAlign: "center",
                  padding: "0.75rem 0.875rem",
                  fontWeight: "600",
                  color: "var(--ink-0)"
                }}
              >
                Tracking
              </th>
              <th
                scope="col"
                aria-sort={getAriaSort("total")}
                style={{
                  textAlign: "right",
                  padding: "0.75rem 0.875rem",
                  fontWeight: "600",
                  color: "var(--ink-0)"
                }}
              >
                <Link
                  href={createSortHref("total")}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    width: "100%",
                    minHeight: "44px"
                  }}
                >
                  Total (ETB)
                  {renderSortIndicator("total")}
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid var(--rule)" }}>
                <td style={{ padding: "0.75rem 0.875rem", fontWeight: "600" }}>
                  <Link
                    href={`/orders/${order.id}`}
                    style={{
                      color: "var(--ink-0)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: "44px"
                    }}
                  >
                    {order.id}
                  </Link>
                </td>
                <td style={{ padding: "0.75rem 0.875rem", color: "var(--ink-2)" }}>
                  {when(order.createdAt)}
                </td>
                <td style={{ padding: "0.75rem 0.875rem", color: "var(--ink-0)", fontWeight: "600" }}>
                  {order.name}
                </td>
                <td style={{ padding: "0.75rem 0.875rem", color: "var(--ink-2)" }}>
                  {order.area}
                </td>
                <td style={{ padding: "0.75rem 0.875rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "var(--r)",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      textTransform: "capitalize",
                      // Mono and tracked out, so the chip reads as a stamp on an
                      // order ticket rather than a rounded status pill.
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.03em",
                      backgroundColor:
                        order.status === "delivered"
                          ? "var(--ok-wash)"
                          : order.status === "ready"
                          ? "var(--signal-wash)"
                          : order.status === "out_for_delivery"
                          ? "var(--surface-sunken)"
                          : order.status === "cooking"
                          ? "var(--surface-sunken)"
                          : order.status === "cancelled"
                          ? "var(--danger-wash)"
                          : "var(--surface-sunken)",
                      color:
                        order.status === "delivered"
                          ? "var(--ok-ink)"
                          : order.status === "ready"
                          ? "var(--signal-ink)"
                          : order.status === "out_for_delivery"
                          ? "var(--ink-1)"
                          : order.status === "cooking"
                          ? "var(--ink-2)"
                          : order.status === "cancelled"
                          ? "var(--danger-ink)"
                          : "var(--ink-3)"
                    }}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 0.875rem", textAlign: "center" }}>
                  <Link
                    href={`/order-status?id=${order.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "44px",
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.8125rem",
                      color: "var(--ink-0)",
                      textDecoration: "none",
                      fontWeight: "600",
                      borderRadius: "var(--r)",
                      border: "1px solid var(--rule)",
                      backgroundColor: "var(--surface-sunken)"
                    }}
                  >
                    <Icon name="pin" /> Live Map
                  </Link>
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.875rem",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: "700",
                    color: "var(--ink-0)"
                  }}
                >
                  {etb(order.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav
        aria-label="Orders table pagination"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "1.25rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--rule)"
        }}
      >
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--ink-2)" }}>
          Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of <strong>{totalCount}</strong> orders
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {currentPage > 1 ? (
            <Link
              href={createPageHref(currentPage - 1)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "44px",
                minWidth: "44px",
                padding: "0.5rem 1rem",
                borderRadius: "var(--r)",
                border: "1px solid var(--rule)",
                backgroundColor: "var(--surface)",
                color: "var(--ink-0)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "600"
              }}
            >
              Previous
            </Link>
          ) : (
            <span
              aria-disabled="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "44px",
                minWidth: "44px",
                padding: "0.5rem 1rem",
                borderRadius: "var(--r)",
                border: "1px solid var(--rule)",
                backgroundColor: "var(--surface-sunken)",
                color: "var(--ink-3)",
                fontSize: "0.875rem",
                cursor: "not-allowed"
              }}
            >
              Previous
            </span>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isCurrent = p === currentPage;
            return (
              <Link
                key={p}
                href={createPageHref(p)}
                aria-current={isCurrent ? "page" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "44px",
                  minWidth: "44px",
                  padding: "0.5rem",
                  borderRadius: "var(--r)",
                  border: isCurrent ? "2px solid var(--signal)" : "1px solid var(--rule)",
                  backgroundColor: isCurrent ? "var(--signal)" : "var(--surface)",
                  color: isCurrent ? "var(--on-accent)" : "var(--ink-0)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: isCurrent ? "700" : "500"
                }}
              >
                {p}
              </Link>
            );
          })}

          {currentPage < totalPages ? (
            <Link
              href={createPageHref(currentPage + 1)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "44px",
                minWidth: "44px",
                padding: "0.5rem 1rem",
                borderRadius: "var(--r)",
                border: "1px solid var(--rule)",
                backgroundColor: "var(--surface)",
                color: "var(--ink-0)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "600"
              }}
            >
              Next
            </Link>
          ) : (
            <span
              aria-disabled="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "44px",
                minWidth: "44px",
                padding: "0.5rem 1rem",
                borderRadius: "var(--r)",
                border: "1px solid var(--rule)",
                backgroundColor: "var(--surface-sunken)",
                color: "var(--ink-3)",
                fontSize: "0.875rem",
                cursor: "not-allowed"
              }}
            >
              Next
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}
