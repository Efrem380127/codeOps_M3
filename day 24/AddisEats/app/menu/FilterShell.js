"use client";

import { useState } from "react";

export default function FilterShell({ children }) {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div style={{ border: "1px solid #e2e8f0", padding: "1.25rem", borderRadius: "8px", margin: "1rem 0", backgroundColor: "#ffffff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <span style={{ fontWeight: "600", fontSize: "0.875rem", color: "#334155" }}>Filter:</span>
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          style={{
            minHeight: "44px",
            minWidth: "44px",
            padding: "0.5rem 1.15rem",
            borderRadius: "6px",
            border: activeFilter === "all" ? "2px solid #2563eb" : "1px solid #cbd5e1",
            backgroundColor: activeFilter === "all" ? "#eff6ff" : "#ffffff",
            color: activeFilter === "all" ? "#1d4ed8" : "#334155",
            fontWeight: activeFilter === "all" ? "700" : "500",
            cursor: "pointer"
          }}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("popular")}
          style={{
            minHeight: "44px",
            minWidth: "44px",
            padding: "0.5rem 1.15rem",
            borderRadius: "6px",
            border: activeFilter === "popular" ? "2px solid #2563eb" : "1px solid #cbd5e1",
            backgroundColor: activeFilter === "popular" ? "#eff6ff" : "#ffffff",
            color: activeFilter === "popular" ? "#1d4ed8" : "#334155",
            fontWeight: activeFilter === "popular" ? "700" : "500",
            cursor: "pointer"
          }}
        >
          Popular
        </button>
      </div>
      <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1rem" }}>
        Active filter view: <strong style={{ color: "#0f172a" }}>{activeFilter}</strong>
      </p>
      <div>{children}</div>
    </div>
  );
}
