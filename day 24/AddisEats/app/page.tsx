import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { signOut } from "./actions/auth";

export const metadata = {
  title: "Home",
  description: "Welcome to Addis Eats. Order freshly cooked authentic Ethiopian dishes, stews, and cultural books.",
};

export default async function Home() {
  const session = await getSession();

  return (
    <div style={{ padding: "1rem 0" }}>
      <h1 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "0.75rem" }}>
        Welcome to Addis Eats
      </h1>

      <div style={{ margin: "1.5rem 0", maxWidth: "800px" }}>
        <Image
          src="/hero.jpg"
          alt="Addis Eats authentic food and cultural literature display"
          width={800}
          height={400}
          priority
          sizes="(max-width: 768px) 100vw, 800px"
          style={{ width: "100%", height: "auto", borderRadius: "8px", display: "block" }}
        />
      </div>

      <div style={{ margin: "1.25rem 0", padding: "1.25rem", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        {session ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <span style={{ fontSize: "1rem", color: "#1e293b" }}>
              Signed in as: <strong>{session.name}</strong> ({session.role})
            </span>
            <form action={signOut}>
              <button
                type="submit"
                style={{
                  minHeight: "44px",
                  minWidth: "44px",
                  padding: "0.5rem 1.25rem",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "#475569" }}>Not signed in.</span>
            <Link
              href="/sign-in"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "44px",
                padding: "0.5rem 1.25rem",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "600"
              }}
            >
              Sign In here
            </Link>
          </div>
        )}
      </div>

      <nav aria-label="Main application sections" style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <Link
          href="/menu"
          style={{
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem 1.25rem",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            color: "#1e293b",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          Menu & Search
        </Link>
        <Link
          href="/orders"
          style={{
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem 1.25rem",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            color: "#1e293b",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          Orders & Dashboard
        </Link>
        <Link
          href="/order-status"
          style={{
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem 1.25rem",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            color: "#1e293b",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          Order Status
        </Link>
        <Link
          href="/checkout"
          style={{
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem 1.25rem",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            color: "#1e293b",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          Checkout
        </Link>
        <Link
          href="/cart"
          style={{
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem 1.25rem",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            color: "#1e293b",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          Cart
        </Link>
        <Link
          href="/kitchen"
          style={{
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem 1.25rem",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            color: "#1e293b",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          Kitchen (Staff)
        </Link>
      </nav>
    </div>
  );
}
