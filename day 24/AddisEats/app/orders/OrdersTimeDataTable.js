export default function OrdersTimeDataTable({ data = [], totalOrders = 0, totalRevenue = 0 }) {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r)",
        padding: "1.25rem",
        marginTop: "1rem"
      }}
    >
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
            fontWeight: "700",
            fontSize: "0.95rem",
            color: "var(--ink-0)",
            marginBottom: "0.75rem"
          }}
        >
          Daily Orders Volume and Revenue (Accessible Table)
        </caption>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--rule)", backgroundColor: "var(--surface-sunken)" }}>
            <th
              scope="col"
              style={{
                textAlign: "left",
                padding: "0.625rem 0.75rem",
                fontWeight: "700",
                color: "var(--ink-0)"
              }}
            >
              Date
            </th>
            <th
              scope="col"
              style={{
                textAlign: "right",
                padding: "0.625rem 0.75rem",
                fontWeight: "700",
                color: "var(--ink-0)"
              }}
            >
              Order Count (Unit: Orders)
            </th>
            <th
              scope="col"
              style={{
                textAlign: "right",
                padding: "0.625rem 0.75rem",
                fontWeight: "700",
                color: "var(--ink-0)"
              }}
            >
              Daily Revenue (ETB)
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.dateKey} style={{ borderBottom: "1px solid var(--rule)" }}>
              <td style={{ padding: "0.625rem 0.75rem", color: "var(--ink-0)" }}>
                {item.displayDate} ({item.dayName})
              </td>
              <td
                style={{
                  padding: "0.625rem 0.75rem",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums"
                }}
              >
                {item.orderCount}
              </td>
              <td
                style={{
                  padding: "0.625rem 0.75rem",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: "600"
                }}
              >
                {`${item.revenue.toLocaleString()} ETB`}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid var(--rule)", backgroundColor: "var(--surface-sunken)", fontWeight: "700" }}>
            <td style={{ padding: "0.625rem 0.75rem", color: "var(--ink-0)" }}>
              Total
            </td>
            <td
              style={{
                padding: "0.625rem 0.75rem",
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                color: "var(--ink-0)"
              }}
            >
              {totalOrders}
            </td>
            <td
              style={{
                padding: "0.625rem 0.75rem",
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                color: "var(--ink-0)"
              }}
            >
              {`${totalRevenue.toLocaleString()} ETB`}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
