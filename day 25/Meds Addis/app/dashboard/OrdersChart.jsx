"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { dateOnly } from "@/lib/format";

/**
 * Orders per day over the last fortnight.
 *
 * The data comes from lib/orders.js `ordersByDay`, which fills the gaps — a day
 * with no orders is a real zero and appears as one. A line chart drawn only from
 * days that had orders is a lie about the shape of the week, and it is the most
 * common mistake in a dashboard like this.
 *
 * Rendered alongside <OrdersTimeTable> for the same reason the revenue chart
 * sits beside its table: the chart is aria-hidden, the table carries the data.
 *
 * The line is ink, not the accent. A trend line is not a signal — it is the
 * baseline the rest of the dashboard is read against, and amber is reserved for
 * things that need acting on.
 */
export default function OrdersChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="chart" role="status">
        <p className="small muted mb-0">No orders in the last 14 days.</p>
      </div>
    );
  }

  const chartData = data.map((point) => ({
    ...point,
    label: dateOnly.format(new Date(`${point.date}T09:00:00.000Z`)),
  }));

  return (
    <div className="chart" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--ink-3)" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--ink-3)" }}
            width={34}
          />
          <Tooltip
            formatter={(value, name) => [value, name]}
            contentStyle={{
              borderRadius: 0,
              border: "1px solid var(--rule-strong)",
              background: "var(--surface)",
              color: "var(--ink-0)",
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="var(--ink-0)"
            strokeWidth={1.75}
            dot={{ r: 2.5, fill: "var(--ink-0)", strokeWidth: 0 }}
            activeDot={{ r: 4, fill: "var(--signal)", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
