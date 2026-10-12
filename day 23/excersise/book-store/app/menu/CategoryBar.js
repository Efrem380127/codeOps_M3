export default function CategoryBar() {
  const categories = ["All", "Fiction", "Science", "History"];

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "1rem 0" }}>
      {categories.map((cat, idx) => (
        <button
          key={cat}
          type="button"
          style={{
            minHeight: "44px",
            minWidth: "44px",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: idx === 0 ? "2px solid #2563eb" : "1px solid #cbd5e1",
            backgroundColor: idx === 0 ? "#eff6ff" : "#ffffff",
            color: idx === 0 ? "#1d4ed8" : "#334155",
            fontWeight: idx === 0 ? "700" : "500",
            cursor: "pointer"
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}