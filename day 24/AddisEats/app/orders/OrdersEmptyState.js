import Link from "next/link";

export default function OrdersEmptyState({ isForced = false }) {
  return (
    <section
      aria-labelledby="empty-orders-heading"
      style={{
        padding: "3.5rem 2rem",
        textAlign: "center",
        backgroundColor: "var(--surface)",
        border: "1px dashed var(--rule)",
        borderRadius: "var(--r)",
        margin: "1.5rem 0"
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "var(--surface-sunken)",
          color: "var(--ink-2)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          marginBottom: "1rem"
        }}
      >
        0
      </div>

      <h2
        id="empty-orders-heading"
        style={{
          fontSize: "1.375rem",
          fontWeight: "600",
          color: "var(--ink-0)",
          marginBottom: "0.5rem"
        }}
      >
        No Orders Recorded Yet
      </h2>

      <p
        style={{
          maxWidth: "460px",
          margin: "0 auto 1.5rem auto",
          color: "var(--ink-2)",
          lineHeight: "1.5"
        }}
      >
        There are currently no active or historical orders for this profile.
        Once an order is confirmed, revenue trends and fulfillment tables will be aggregated here.
      </p>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/menu"
          style={{
            display: "inline-block",
            backgroundColor: "var(--ink-0)",
            color: "var(--on-accent)",
            padding: "0.6rem 1.25rem",
            borderRadius: "var(--r)",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "0.9375rem"
          }}
        >
          Browse Menu
        </Link>

        {isForced && (
          <Link
            href="/orders?state=populated"
            style={{
              display: "inline-block",
              backgroundColor: "var(--surface-sunken)",
              color: "var(--ink-0)",
              border: "1px solid var(--rule)",
              padding: "0.6rem 1.25rem",
              borderRadius: "var(--r)",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "0.9375rem"
            }}
          >
            Switch to Populated State
          </Link>
        )}
      </div>
    </section>
  );
}
