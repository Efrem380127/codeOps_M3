export default function MapPlaceholder() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading delivery tracking map"
      style={{
        height: "360px",
        width: "100%",
        backgroundColor: "var(--surface-sunken)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        color: "var(--ink-2)"
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid var(--rule)",
          borderTopColor: "var(--ink-0)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}
      />
      <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
        Loading Live Delivery Map...
      </span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
