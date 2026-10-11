import Link from "next/link";

export default function NavigationButton() {
  return (
    <Link
      href="/cart"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "44px",
        minWidth: "44px",
        padding: "0.5rem 1.25rem",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        borderRadius: "6px",
        textDecoration: "none",
        fontWeight: "600",
        fontSize: "0.875rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}
    >
      Go to Cart
    </Link>
  );
}