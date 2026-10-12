import Link from "next/link";
import Counter from "./Counter";

export default function MenuLayout({ children }) {
  const categories = [
    { name: "All Books", href: "/menu" },
    { name: "Traditional Meat", href: "/menu?category=meat" },
    { name: "Fasting & Veg", href: "/menu?category=fasting" },
    { name: "Tej & Beverages", href: "/menu?category=drinks" }
  ];

  return (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
      <aside aria-label="Menu categories and order counter" style={{ flex: "0 0 240px" }}>
        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem", color: "#0f172a" }}>Categories</h2>
        <ul style={{ listStyle: "none", margin: "0.75rem 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {categories.map((cat) => (
            <li key={cat.href}>
              <Link
                href={cat.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  width: "100%",
                  minHeight: "44px",
                  padding: "0.5rem 0.85rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "0.875rem",
                  transition: "all 0.15s ease"
                }}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: "600", display: "block", marginBottom: "0.5rem", color: "#475569" }}>
            Table Quick Counter
          </span>
          <Counter />
        </div>
      </aside>

      <div style={{ flex: "1 1 500px", minWidth: "300px" }}>{children}</div>
    </div>
  );
}
