"use client";

import { useActionState, useState } from "react";
import { signIn } from "../actions/auth";

export default function SignInForm({ nextUrl }) {
  const [state, formAction, isPending] = useActionState(signIn, { error: null });
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("customer");

  function setPreset(name, userRole) {
    setUsername(name);
    setRole(userRole);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setUsername("");
    }
  }

  return (
    <div
      onKeyDown={handleKeyDown}
      style={{
        maxWidth: "460px",
        margin: "0 auto",
        padding: "1.75rem",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
      }}
    >
      <h2 style={{ marginBottom: "1.25rem", textAlign: "center", color: "#0f172a" }}>
        Sign In
      </h2>

      {nextUrl && (
        <div style={{ padding: "0.625rem 0.875rem", backgroundColor: "#f1f5f9", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Target destination: <code>{nextUrl}</code>
        </div>
      )}

      {state?.error && (
        <p role="alert" style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem", fontWeight: "600" }}>
          {state.error}
        </p>
      )}

      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <input type="hidden" name="next" value={nextUrl || ""} />

        <div>
          <label htmlFor="username" style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a" }}>
            Username
          </label>
          <input
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Abebe Bikila"
            required
            style={{ width: "100%", minHeight: "44px" }}
          />
        </div>

        <div>
          <label htmlFor="role" style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a" }}>
            Role
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", minHeight: "44px" }}
          >
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          style={{
            width: "100%",
            minHeight: "48px",
            padding: "0.75rem",
            backgroundColor: isPending ? "#94a3b8" : "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: isPending ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: "1rem"
          }}
        >
          {isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div style={{ marginTop: "1.75rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.25rem" }}>
        <p style={{ fontSize: "0.875rem", color: "#475569", marginBottom: "0.75rem", fontWeight: "600" }}>
          Quick test accounts:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setPreset("Abebe Bikila", "customer")}
            style={{
              minHeight: "44px",
              padding: "0.625rem 1rem",
              textAlign: "left",
              justifyContent: "flex-start",
              fontSize: "0.875rem",
              cursor: "pointer",
              borderRadius: "6px",
              border: "1px solid #cbd5e1"
            }}
          >
            Abebe Bikila (Customer - has seed order)
          </button>
          <button
            type="button"
            onClick={() => setPreset("Chala Kebede", "customer")}
            style={{
              minHeight: "44px",
              padding: "0.625rem 1rem",
              textAlign: "left",
              justifyContent: "flex-start",
              fontSize: "0.875rem",
              cursor: "pointer",
              borderRadius: "6px",
              border: "1px solid #cbd5e1"
            }}
          >
            Chala Kebede (Customer - different account)
          </button>
          <button
            type="button"
            onClick={() => setPreset("Chef Almaz", "staff")}
            style={{
              minHeight: "44px",
              padding: "0.625rem 1rem",
              textAlign: "left",
              justifyContent: "flex-start",
              fontSize: "0.875rem",
              cursor: "pointer",
              borderRadius: "6px",
              border: "1px solid #cbd5e1"
            }}
          >
            Chef Almaz (Staff - kitchen access)
          </button>
        </div>
      </div>
    </div>
  );
}
