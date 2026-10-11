"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { placeOrder, cancelOrder } from "../actions/order";

const AREA_OPTIONS = ["Bole", "Kazanchis", "Megenagna", "Piassa"];

export default function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(placeOrder, {
    fieldErrors: {},
    success: false
  });
  const [cancelMessage, setCancelMessage] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!isPending) {
      isSubmittingRef.current = false;
    }
  }, [isPending]);

  function handleSubmit(e) {
    if (isPending || isSubmittingRef.current) {
      e.preventDefault();
      return;
    }
    isSubmittingRef.current = true;
  }

  async function handleCancel(id) {
    if (cancelling) return;
    setCancelling(true);
    try {
      const res = await cancelOrder(id);
      if (res?.error) {
        setCancelMessage(res.error);
      } else {
        setCancelMessage("Order cancelled successfully");
      }
    } finally {
      setCancelling(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setCancelMessage(null);
    }
  }

  if (state?.success && state?.order) {
    return (
      <div
        onKeyDown={handleKeyDown}
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          padding: "1.75rem",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
        }}
      >
        <h2 style={{ fontSize: "1.5rem", color: "#15803d", marginBottom: "0.5rem" }}>
          Order Confirmed!
        </h2>
        <p style={{ margin: "0.25rem 0", color: "#334155" }}>
          Order ID: <strong>{state.order.id}</strong>
        </p>
        <p style={{ margin: "0.25rem 0", color: "#334155" }}>
          Thank you, <strong>{state.order.name}</strong>. Your order has been placed.
        </p>
        <p style={{ margin: "0.25rem 0", color: "#334155" }}>
          Status: <strong style={{ textTransform: "capitalize" }}>{state.order.status}</strong>
        </p>
        {cancelMessage && (
          <p
            role="status"
            aria-live="polite"
            style={{ color: "#dc2626", fontWeight: "600", marginTop: "0.5rem" }}
          >
            {cancelMessage}
          </p>
        )}
        {state.order.status !== "cancelled" && (
          <button
            type="button"
            disabled={cancelling}
            onClick={() => handleCancel(state.order.id)}
            style={{
              marginTop: "1.25rem",
              minHeight: "44px",
              padding: "0.625rem 1.25rem",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              border: "1px solid #b91c1c",
              borderRadius: "6px",
              cursor: cancelling ? "not-allowed" : "pointer",
              fontWeight: "600"
            }}
          >
            {cancelling ? "Cancelling Order..." : "Cancel Order"}
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        maxWidth: "520px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        padding: "1.75rem",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
      }}
    >
      <div>
        <label htmlFor="name" style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a" }}>
          Full Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={state?.data?.name || ""}
          required
          aria-describedby={state?.fieldErrors?.name ? "name-error" : undefined}
          style={{ width: "100%", minHeight: "44px" }}
        />
        {state?.fieldErrors?.name && (
          <p id="name-error" style={{ color: "#dc2626", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a" }}>
          TeleBirr Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          placeholder="09XXXXXXXX or +2519XXXXXXXX"
          defaultValue={state?.data?.phone || ""}
          required
          aria-describedby={state?.fieldErrors?.phone ? "phone-error" : undefined}
          style={{ width: "100%", minHeight: "44px" }}
        />
        {state?.fieldErrors?.phone && (
          <p id="phone-error" style={{ color: "#dc2626", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {state.fieldErrors.phone}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="area" style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a" }}>
          Delivery Area
        </label>
        <select
          id="area"
          name="area"
          defaultValue={state?.data?.area || "Bole"}
          aria-describedby={state?.fieldErrors?.area ? "area-error" : undefined}
          style={{ width: "100%", minHeight: "44px" }}
        >
          {AREA_OPTIONS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.area && (
          <p id="area-error" style={{ color: "#dc2626", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {state.fieldErrors.area}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes" style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a" }}>
          Delivery Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Building name, floor, or nearby landmark"
          defaultValue={state?.data?.notes || ""}
          aria-describedby={state?.fieldErrors?.notes ? "notes-error" : undefined}
          style={{ width: "100%", minHeight: "88px" }}
        />
        {state?.fieldErrors?.notes && (
          <p id="notes-error" style={{ color: "#dc2626", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {state.fieldErrors.notes}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        style={{
          width: "100%",
          minHeight: "48px",
          padding: "0.75rem 1.5rem",
          backgroundColor: isPending ? "#94a3b8" : "#2563eb",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          cursor: isPending ? "not-allowed" : "pointer",
          fontWeight: "700",
          fontSize: "1rem"
        }}
      >
        {isPending ? "Placing Order..." : "Place Order"}
      </button>
    </form>
  );
}
