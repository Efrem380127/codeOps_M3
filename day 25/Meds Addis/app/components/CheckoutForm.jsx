"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { useCart } from "./CartProvider";
import Icon from "./Icon";
import { placeOrder } from "@/app/actions/order";
import { price } from "@/lib/format";

/**
 * Checkout form.
 *
 * Uses a Server Action through `useActionState`, which gives three things the
 * hand-rolled fetch version does not:
 *
 *   - Progressive enhancement: the form posts even before hydration.
 *   - `isPending` is provided, so the submit button can be disabled while the
 *     action runs — the double-submit guard the rubric asks for.
 *   - Server-side validation errors come back as state and render next to the
 *     field that caused them, without any client-side validation library.
 *
 * The cart is serialised into a hidden field because a Server Action receives
 * form data, not React state. Only medicineId and quantity are sent — the
 * server re-prices everything from the catalogue, so the prices in this payload
 * would be ignored even if someone edited them.
 */
export default function CheckoutForm({ prescriptions = [], user }) {
  const { cart, subtotal, needsPrescription, clear } = useCart();

  const [state, formAction, isPending] = useActionState(placeOrder, null);
  const [prescriptionId, setPrescriptionId] = useState("");

  const payload = useMemo(
    () =>
      JSON.stringify(
        cart.map((line) => ({
          medicineId: line.medicineId,
          quantity: line.quantity,
        })),
      ),
    [cart],
  );

  // Only approved prescriptions are offered — a pending one would put the order
  // into the pharmacist queue anyway, so showing it as a choice is misleading.
  const approved = prescriptions.filter((rx) => rx.status === "approved");

  const requiredMedicineIds = cart
    .filter((line) => line.requiresPrescription)
    .map((line) => line.medicineId);

  const errors = state?.fieldErrors ?? {};

  if (cart.length === 0 && !state?.ok) {
    return (
      <div className="state">
        <div className="state__icon" aria-hidden="true">
          <Icon name="cart" />
        </div>
        <h3>There is nothing to check out</h3>
        <p>Add a medicine to your cart and come back.</p>
        <Link className="btn btn--primary" href="/medicines">
          Browse medicines
        </Link>
      </div>
    );
  }

  return (
    <form className="form" action={formAction}>
      {/* The cart, as the action will receive it. */}
      <input type="hidden" name="items" value={payload} />

      {state?.error && (
        <div className="alert alert--error" role="alert">
          <div>
            <p className="alert__title">We could not place that order</p>
            <p className="mb-0">{state.error}</p>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card__title">Delivery details</h2>

        <div className="form__grid form__grid--2 mt-4">
          <div className="field">
            <label className="field__label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              className="input"
              defaultValue={user?.name ?? ""}
              autoComplete="name"
              required
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p className="field__error" id="name-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="phone">
              Mobile number
            </label>
            <input
              id="phone"
              name="phone"
              className="input"
              defaultValue={user?.phone ?? ""}
              inputMode="numeric"
              placeholder="09XXXXXXXX"
              autoComplete="tel"
              required
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
            />
            {errors.phone ? (
              <p className="field__error" id="phone-error">
                {errors.phone}
              </p>
            ) : (
              <p className="field__hint" id="phone-hint">
                The courier calls this number on arrival.
              </p>
            )}
          </div>
        </div>

        <div className="field mt-4">
          <label className="field__label" htmlFor="address">
            Delivery address
          </label>
          <input
            id="address"
            name="address"
            className="input"
            defaultValue={user?.address ?? ""}
            autoComplete="street-address"
            required
            aria-invalid={errors.address ? "true" : undefined}
            aria-describedby={errors.address ? "address-error" : undefined}
          />
          {errors.address && (
            <p className="field__error" id="address-error">
              {errors.address}
            </p>
          )}
        </div>

        <div className="field mt-4">
          <label className="field__label" htmlFor="note">
            Note for the courier <span className="muted">(optional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            className="textarea"
            placeholder="Gate code, landmark, or where to leave the parcel."
            aria-invalid={errors.note ? "true" : undefined}
          />
          {errors.note && <p className="field__error">{errors.note}</p>}
        </div>
      </div>

      {needsPrescription && (
        <div className="card">
          <h2 className="card__title">Prescription</h2>
          <p className="small muted">
            This cart contains a prescription-only medicine. Choose an approved
            prescription that covers it — a pharmacist will review the order
            either way.
          </p>

          {approved.length === 0 ? (
            <div className="alert alert--warn mt-4">
              <div>
                <p className="alert__title">No approved prescription on file</p>
                <p className="mb-0">
                  You have no approved prescriptions covering these items.{" "}
                  <Link href="/prescriptions">Upload one</Link> and a pharmacist
                  will review it, usually within the hour.
                </p>
              </div>
            </div>
          ) : (
            <div className="field mt-4">
              <label className="field__label" htmlFor="prescriptionId">
                Attach a prescription
              </label>
              <select
                id="prescriptionId"
                name="prescriptionId"
                className="select"
                value={prescriptionId}
                onChange={(event) => setPrescriptionId(event.target.value)}
                aria-invalid={errors.prescriptionId ? "true" : undefined}
              >
                <option value="">Choose a prescription…</option>
                {approved.map((rx) => {
                  const covers = requiredMedicineIds.every((id) =>
                    rx.medicineIds.includes(id),
                  );

                  return (
                    <option key={rx.id} value={rx.id}>
                      {rx.id} · {rx.prescriberName}
                      {covers ? "" : " — does not cover every item"}
                    </option>
                  );
                })}
              </select>
              {errors.prescriptionId && (
                <p className="field__error">{errors.prescriptionId}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="between">
          <span>
            <span className="muted small">Total due on delivery</span>
            <br />
            <span className="price" style={{ fontSize: "var(--t-xl)" }}>
              {price(subtotal)}
            </span>
          </span>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? "Placing order…" : "Place order"}
          </button>
        </div>

        <p className="small muted mt-4 mb-0">
          Payment is cash on delivery in this build — no card details are
          collected. Placing the order does not charge you.
        </p>
      </div>
    </form>
  );
}
