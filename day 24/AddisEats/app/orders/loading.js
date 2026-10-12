export default function OrdersLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ height: "28px", width: "180px", backgroundColor: "var(--surface-sunken)", borderRadius: "var(--r)", marginBottom: "0.5rem" }} />
        <div style={{ height: "16px", width: "260px", backgroundColor: "var(--surface-sunken)", borderRadius: "var(--r)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ padding: "1.25rem", backgroundColor: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "var(--r)" }}>
            <div style={{ height: "14px", width: "90px", backgroundColor: "var(--surface-sunken)", borderRadius: "var(--r)", marginBottom: "0.75rem" }} />
            <div style={{ height: "24px", width: "120px", backgroundColor: "var(--rule)", borderRadius: "var(--r)" }} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ height: "340px", backgroundColor: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "var(--r)", padding: "1.25rem" }}>
          <div style={{ height: "20px", width: "140px", backgroundColor: "var(--surface-sunken)", borderRadius: "var(--r)", marginBottom: "1rem" }} />
          <div style={{ height: "260px", backgroundColor: "var(--surface-sunken)", borderRadius: "var(--r)" }} />
        </div>
        <div style={{ height: "340px", backgroundColor: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "var(--r)", padding: "1.25rem" }}>
          <div style={{ height: "20px", width: "200px", backgroundColor: "var(--surface-sunken)", borderRadius: "var(--r)", marginBottom: "1rem" }} />
          <div style={{ height: "260px", backgroundColor: "var(--surface-sunken)", borderRadius: "var(--r)" }} />
        </div>
      </div>

      <div style={{ height: "260px", backgroundColor: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "var(--r)", padding: "1.25rem" }}>
        <div style={{ height: "20px", width: "180px", backgroundColor: "var(--surface-sunken)", borderRadius: "var(--r)", marginBottom: "1rem" }} />
        <div style={{ height: "180px", backgroundColor: "var(--surface-sunken)", borderRadius: "var(--r)" }} />
      </div>
    </div>
  );
}
