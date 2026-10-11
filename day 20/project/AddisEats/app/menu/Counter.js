"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0" }}>
      <button
        type="button"
        onClick={() => setCount((c) => Math.max(0, c - 1))}
        aria-label="Decrease quantity"
        style={{
          width: "44px",
          height: "44px",
          minWidth: "44px",
          minHeight: "44px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          fontWeight: "700",
          borderRadius: "6px",
          border: "1px solid #cbd5e1",
          backgroundColor: "#ffffff",
          color: "#1e293b",
          cursor: "pointer"
        }}
      >
        -
      </button>

      <span
        aria-live="polite"
        style={{
          minWidth: "36px",
          textAlign: "center",
          fontWeight: "700",
          fontSize: "1.125rem",
          color: "#0f172a"
        }}
      >
        {count}
      </span>

      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        aria-label="Increase quantity"
        style={{
          width: "44px",
          height: "44px",
          minWidth: "44px",
          minHeight: "44px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          fontWeight: "700",
          borderRadius: "6px",
          border: "1px solid #cbd5e1",
          backgroundColor: "#ffffff",
          color: "#1e293b",
          cursor: "pointer"
        }}
      >
        +
      </button>
    </div>
  );
}
