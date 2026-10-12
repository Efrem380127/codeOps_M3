"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { price } from "@/lib/format";

/**
 * Revenue by therapeutic category.
 *
 * Recharts needs a client component and a fixed-height parent — ResponsiveContainer
 * collapses to zero height inside a grid cell that has no intrinsic height, which
 * is why `.chart` sets one in globals.css rather than leaving it to the chart.
 *
 * A chart is not accessible on its own, so this is always rendered alongside
 * <RevenueTable> (the same numbers as a real table). The chart is marked
 * aria-hidden and the table carries the meaning; that pairing is the difference
 * between a decoration and a data visualisation.
 *
 * Colour: this used to cycle a nine-hue palette, one per bar. That is a mistake
 * twice over. It is the "rainbow chart" reflex, and it encodes nothing — the
 * category is already written on the x-axis, so nine colours add nine decisions
 * for the reader and no information. Now every bar is the same ink, and only the
 * highest one carries amber. One colour, one meaning: this is the leader.
 *
 * Colours are CSS custom properties rather than literals, so the chart follows
 * the light/dark theme without a second palette to keep in sync.
 */
export default function RevenueChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="chart" role="status">
        <p className="small muted mb-0">No revenue recorded yet.</p>
      </div>
    );
  }

  const peak = data.reduce(
    (best, entry) => (entry.revenue > best ? entry.revenue : best),
    -Infinity,
  );

  return (
    <div className="chart" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: "var(--ink-3)" }}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={58}
          />
          <YAxis
            tickFormatter={(value) => price(value)}
            tick={{ fontSize: 11, fill: "var(--ink-3)" }}
            width={78}
          />
          <Tooltip
            formatter={(value) => [price(value), "Revenue"]}
            contentStyle={{
              borderRadius: 0,
              border: "1px solid var(--rule-strong)",
              background: "var(--surface)",
              color: "var(--ink-0)",
              fontSize: 13,
            }}
          />
          {/* Square bars. The system has no rounded corners anywhere else. */}
          <Bar dataKey="revenue" name="Revenue" radius={0}>
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={entry.revenue === peak ? "var(--signal)" : "var(--ink-2)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
