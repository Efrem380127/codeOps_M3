import { etb } from "@/lib/format";

export default function ChartDataTable({ dailyMetrics = [], totalOrders = 0, totalRevenue = 0 }) {
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
            fontSize: "1rem",
            color: "var(--ink-0)",
            marginBottom: "0.75rem"
          }}
        >
          Daily Chart Summary (Accessible Tabular View)
        </caption>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--rule)", backgroundColor: "var(--surface-sunken)" }}>
            <th
              scope="col"
              style={{
                textAlign: "left",
                padding: "0.625rem 0.75rem",
                fontWeight: "600",
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
                fontWeight: "600",
                color: "var(--ink-0)"
              }}
            >
              Orders Count (Unit: Orders)
            </th>
            <th
              scope="col"
              style={{
                textAlign: "right",
                padding: "0.625rem 0.75rem",
                fontWeight: "600",
                color: "var(--ink-0)"
              }}
            >
              Daily Revenue (ETB)
            </th>
          </tr>
        </thead>
        <tbody>
          {dailyMetrics.map((day) => (
            <tr key={day.dateKey} style={{ borderBottom: "1px solid var(--rule)" }}>
              <td style={{ padding: "0.625rem 0.75rem", color: "var(--ink-0)" }}>
                {day.displayDate} ({day.dayName})
              </td>
              <td
                style={{
                  padding: "0.625rem 0.75rem",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums"
                }}
              >
                {day.orderCount}
              </td>
              <td
                style={{
                  padding: "0.625rem 0.75rem",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums"
                }}
              >
                {etb(day.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid var(--rule)", backgroundColor: "var(--surface-sunken)", fontWeight: "600" }}>
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
              {etb(totalRevenue)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
