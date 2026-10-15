"use client";

import { useActionState, useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";

import { placeOrder, cancelOrder } from "../actions/order";
import { useCart } from "../components/CartProvider";

const AREA_OPTIONS = ["Bole", "Kazanchis", "Megenagna", "Piassa"];

export default function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(placeOrder, {
    fieldErrors: {},
    success: false
  });
  const [cancelMessage, setCancelMessage] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const isSubmittingRef = useRef(false);

  const { items, itemCount, subtotal, deliveryFee, total, clear } = useCart();

  // Only the identity and the quantity travel to the server. The prices are
  // resolved from the catalogue on that side, so the request cannot set its
  // own. This is the payload that used to be missing entirely: the form
  // collected an address and posted it with no dishes, so every order created
  // through checkout arrived with no lines and no total.
  const payload = useMemo(
    () => JSON.stringify(items.map(({ id, quantity }) => ({ id, quantity }))),
    [items]
  );

  const isEmpty = items.length === 0;

  useEffect(() => {
    if (!isPending) {
      isSubmittingRef.current = false;
    }
  }, [isPending]);

  // The order exists and has been priced, so the basket it came from is spent.
  // Without this the visitor is left on a checkout still holding the dishes
  // they just paid for.
  useEffect(() => {
    if (state?.success) clear();
  }, [state?.success, clear]);

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
          border: "1px solid var(--rule)",
          borderRadius: "var(--r)",
          backgroundColor: "var(--surface)"
        }}
      >
        <h2 style={{ fontSize: "1.5rem", color: "var(--ok-ink)", marginBottom: "0.5rem" }}>
          Order Confirmed!
        </h2>
        <p style={{ margin: "0.25rem 0", color: "var(--ink-0)" }}>
          Order ID: <strong>{state.order.id}</strong>
        </p>
        <p style={{ margin: "0.25rem 0", color: "var(--ink-0)" }}>
          Thank you, <strong>{state.order.name}</strong>. Your order has been placed.
        </p>
        <p style={{ margin: "0.25rem 0", color: "var(--ink-0)" }}>
          Status: <strong style={{ textTransform: "capitalize" }}>{state.order.status}</strong>
        </p>

        {/* The receipt. An order confirmation that does not say what was
            ordered or what it cost is not a confirmation. */}
        {state.order.items?.length > 0 && (
          <>
            <ul className="data-list" style={{ marginTop: "1rem" }}>
              {state.order.items.map((line) => (
                <li key={line.id ?? line.name} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span>
                    {line.name} &times; {line.quantity}
                  </span>
                  <span className="num">{line.price * line.quantity} ETB</span>
                </li>
              ))}
            </ul>
            <p style={{ margin: "0.75rem 0 0", color: "var(--ink-0)" }}>
              Total billed: <strong className="num">{state.order.total} ETB</strong>
            </p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--ink-2)" }}>
              Delivery to {state.order.area} · {state.order.phone}
            </p>
          </>
        )}
        {cancelMessage && (
          <p
            role="status"
            aria-live="polite"
            style={{ color: "var(--danger-ink)", fontWeight: "600", marginTop: "0.5rem" }}
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
              backgroundColor: "var(--danger)",
              color: "var(--on-accent)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--r)",
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

  // An empty basket has nothing to price, so the form is not shown at all.
  // Previously it rendered anyway and posted an order with no dishes.
  if (isEmpty) {
    return (
      <div className="card empty-state">
        <h2>Nothing to check out yet.</h2>
        <p>Add a dish from the menu and it will show up here with the delivery fee.</p>
        <Link href="/menu" className="btn btn-primary">
          Browse the menu
        </Link>
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
        backgroundColor: "var(--surface)",
        padding: "1.75rem",
        borderRadius: "var(--r)",
        border: "1px solid var(--rule)"
      }}
    >
      {/* The cart, as the server will re-price it. */}
      <input type="hidden" name="items" value={payload} readOnly />

      <div
        style={{
          backgroundColor: "var(--surface-sunken)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--r)",
          padding: "1rem"
        }}
      >
        <h2 style={{ fontSize: "1rem", margin: "0 0 0.5rem", color: "var(--ink-0)" }}>
          Your order
        </h2>
        <ul className="data-list" style={{ margin: 0 }}>
          {items.map((item) => (
            <li
              key={item.id}
              style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}
            >
              <span>
                {item.name} &times; {item.quantity}
              </span>
              <span className="num">{item.price * item.quantity} ETB</span>
            </li>
          ))}
        </ul>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", color: "var(--ink-2)" }}>
          {itemCount} {itemCount === 1 ? "portion" : "portions"} · subtotal {subtotal} ETB ·
          delivery {deliveryFee} ETB
        </p>
        <p style={{ margin: "0.25rem 0 0", color: "var(--ink-0)" }}>
          <strong>
            Total <span className="num">{total} ETB</span>
          </strong>
        </p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.8125rem" }}>
          <Link href="/cart">Edit your cart</Link>
        </p>
      </div>

      {state?.fieldErrors?.items && (
        <p role="alert" style={{ color: "var(--danger-ink)", fontWeight: "600", margin: 0 }}>
          {state.fieldErrors.items}
        </p>
      )}

      <div>
        <label htmlFor="name" style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--ink-0)" }}>
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
          <p id="name-error" style={{ color: "var(--danger-ink)", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--ink-0)" }}>
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
          <p id="phone-error" style={{ color: "var(--danger-ink)", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {state.fieldErrors.phone}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="area" style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--ink-0)" }}>
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
          <p id="area-error" style={{ color: "var(--danger-ink)", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {state.fieldErrors.area}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes" style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--ink-0)" }}>
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
          <p id="notes-error" style={{ color: "var(--danger-ink)", fontSize: "0.875rem", margin: "4px 0 0" }}>
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
          backgroundColor: isPending ? "var(--ink-4)" : "var(--signal)",
          // --on-accent is the label for a signal or ink fill; on the grey
          // pending fill it was white-on-grey at 3.2:1. The button is disabled
          // while pending, so WCAG does not require it, but "Placing Order..."
          // is a status message the user has to be able to read.
          color: isPending ? "var(--ink-0)" : "var(--on-accent)",
          border: "none",
          borderRadius: "var(--r)",
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
