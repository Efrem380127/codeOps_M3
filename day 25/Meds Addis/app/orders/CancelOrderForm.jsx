"use client";

import { useActionState } from "react";

import { cancelOrder } from "@/app/actions/order";

/**
 * Cancel an order.
 *
 * The action behind this button is where attack 1 and attack 2 land, so it is
 * worth being explicit about what this component does and does not do:
 *
 *   It DOES  hide the button when the order is not cancellable.
 *   It does NOT enforce anything. Anyone can open the console and call
 *             cancelOrder() with any order id they like. The refusal happens on
 *             the server, in app/actions/order.js, against the session and the
 *             stored record — never against anything this form sends.
 *
 * `useActionState` gives the pending flag for free, which is what disables the
 * button mid-flight and stops a double-submit.
 */
export default function CancelOrderForm({ orderId }) {
  const [state, formAction, isPending] = useActionState(cancelOrder, null);

  if (state?.ok) {
    return (
      <div className="alert alert--ok" role="status">
        <div>
          <p className="alert__title">Order cancelled</p>
          <p className="mb-0">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="orderId" value={orderId} />

      {state?.error && (
        <div className="alert alert--error mb-4" role="alert">
          <div>
            <p className="alert__title">That order was not cancelled</p>
            <p className="mb-0">{state.error}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn btn--danger"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? "Cancelling…" : "Cancel this order"}
      </button>

      <p className="small muted mt-2 mb-0">
        Cancelling is immediate and cannot be undone. Orders already out for
        delivery cannot be recalled from here.
      </p>
    </form>
  );
}
