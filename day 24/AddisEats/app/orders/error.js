"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrdersError({ error, reset }) {
  const router = useRouter();
  return (
    <section
      role="alert"
      aria-labelledby="orders-error-title"
      style={{
        padding: "2.5rem 2rem",
        maxWidth: "600px",
        margin: "2rem auto",
        backgroundColor: "var(--danger-wash)",
        border: "1px solid var(--danger)",
        borderRadius: "var(--r)",
        textAlign: "center"
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "var(--danger-wash)",
          color: "var(--danger-ink)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          fontWeight: "700",
          marginBottom: "1rem"
        }}
      >
        !
      </div>

      <h2
        id="orders-error-title"
        style={{
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "var(--danger-ink)",
          marginBottom: "0.5rem"
        }}
      >
        Failed to Load Order Reports
      </h2>

      <p
        style={{
          color: "var(--danger-ink)",
          fontSize: "0.9375rem",
          marginBottom: "1.5rem",
          lineHeight: "1.5"
        }}
      >
        {error?.message || "An unexpected error occurred while querying order analytics and fulfillment records."}
      </p>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() =>
            typeof reset === "function"
              ? reset()
              : router.push("/orders?state=populated")
          }
          style={{
            backgroundColor: "var(--danger-ink)",
            color: "var(--on-accent)",
            padding: "0.6rem 1.25rem",
            borderRadius: "var(--r)",
            border: "none",
            fontWeight: "500",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          Try Again
        </button>

        <Link
          href="/orders?state=populated"
          style={{
            display: "inline-block",
            backgroundColor: "var(--surface)",
            color: "var(--danger-ink)",
            border: "1px solid var(--danger)",
            padding: "0.6rem 1.25rem",
            borderRadius: "var(--r)",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "0.875rem"
          }}
        >
          Return to Populated View
        </Link>
      </div>
    </section>
  );
}
