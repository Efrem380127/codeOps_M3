"use client";

export default function NeighbourhoodBarChart({ summary }) {
  const data = summary?.revenueByNeighbourhood || [];
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);
  const maxTick = Math.ceil(maxRevenue / 1000) * 1000;
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxTick / tickCount) * i));

  const svgWidth = 620;
  const svgHeight = 240;
  const marginLeft = 85;
  const marginRight = 20;
  const marginTop = 24;
  const marginBottom = 36;

  const chartWidth = svgWidth - marginLeft - marginRight;
  const chartHeight = svgHeight - marginTop - marginBottom;

  const slotWidth = data.length > 0 ? chartWidth / data.length : 0;
  const barWidth = Math.min(42, slotWidth * 0.65);

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--ink-0)", margin: 0 }}>
          Revenue by Neighbourhood (Unit: ETB)
        </h3>
        <span style={{ fontSize: "0.85rem", color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}>
          Total: {summary?.totalRevenue?.toLocaleString()} ETB
        </span>
      </div>

      {/* aspectRatio matches the viewBox exactly, so preserveAspectRatio="none"
          cannot distort the glyphs. A fixed pixel height would stretch them. */}
      <div
        style={{
          aspectRatio: `${svgWidth} / ${svgHeight}`,
          width: "100%",
          position: "relative"
        }}
        role="img"
        aria-label="Bar chart showing revenue by neighbourhood in ETB, starting at zero"
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {ticks.map((tickVal) => {
            const y = marginTop + chartHeight - (tickVal / maxTick) * chartHeight;
            return (
              <g key={tickVal}>
                <line
                  x1={marginLeft}
                  y1={y}
                  x2={marginLeft + chartWidth}
                  y2={y}
                  className={tickVal === 0 ? "chart-axis" : "chart-grid"}
                />
                <text
                  x={marginLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className={tickVal === 0 ? "chart-tick is-zero" : "chart-tick"}
                >
                  {`${tickVal.toLocaleString()} ETB`}
                </text>
              </g>
            );
          })}

          {data.map((item, index) => {
            const barHeight = maxTick > 0 ? (item.revenue / maxTick) * chartHeight : 0;
            const xCenter = marginLeft + index * slotWidth + slotWidth / 2;
            const x = xCenter - barWidth / 2;
            const y = marginTop + chartHeight - barHeight;

            return (
              <g key={item.neighbourhood}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  className={
                    item.revenue === maxRevenue ? "chart-bar is-peak" : "chart-bar"
                  }
                />
                <text
                  x={xCenter}
                  y={Math.max(y - 6, marginTop + 10)}
                  textAnchor="middle"
                  className="chart-value"
                >
                  {`${item.revenue.toLocaleString()} ETB`}
                </text>
                <text
                  x={xCenter}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  className="chart-category"
                >
                  {item.neighbourhood}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
