"use client";

export default function OrdersOverTimeLineChart({ summary }) {
  const data = summary?.ordersOverTime || [];
  const rangeLabel = summary?.rangeLabel || "Past 7 Days";
  const unit = summary?.timeUnit || "Orders";

  const maxOrders = Math.max(...data.map((d) => d.orderCount), 4);
  const maxTick = Math.ceil(maxOrders / 2) * 2;
  const tickCount = maxTick;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i);

  const svgWidth = 620;
  const svgHeight = 220;
  const marginLeft = 50;
  const marginRight = 25;
  const marginTop = 20;
  const marginBottom = 35;

  const chartWidth = svgWidth - marginLeft - marginRight;
  const chartHeight = svgHeight - marginTop - marginBottom;

  const points = data.map((item, index) => {
    const x = marginLeft + (data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2);
    const y = marginTop + chartHeight - (item.orderCount / maxTick) * chartHeight;
    return { x, y, item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

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
      <div style={{ marginBottom: "0.75rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--ink-0)", margin: "0 0 0.25rem 0" }}>
          {`Orders over Time (${rangeLabel}, Unit: ${unit})`}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--ink-3)", margin: 0 }}>
          {`Daily volume frequency recorded across ${rangeLabel.toLowerCase()}`}
        </p>
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
        aria-label={`Line chart showing orders over time across ${rangeLabel} in unit ${unit}, starting at zero`}
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
                  {tickVal}
                </text>
              </g>
            );
          })}

          {points.length > 1 && (
            <polyline className="chart-line" points={polylinePoints} />
          )}

          {points.map((p) => (
            <g key={p.item.dateKey}>
              <circle cx={p.x} cy={p.y} r="5" className="chart-point" />
              <text x={p.x} y={p.y - 8} textAnchor="middle" className="chart-value">
                {p.item.orderCount}
              </text>
              <text
                x={p.x}
                y={svgHeight - 10}
                textAnchor="middle"
                className="chart-category"
              >
                {p.item.displayDate}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
