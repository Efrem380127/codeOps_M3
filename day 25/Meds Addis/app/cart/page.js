"use client";

import Image from "next/image";
import Link from "next/link";

import EmptyState from "@/app/components/EmptyState";
import { useCart, MAX_PER_LINE } from "@/app/components/CartProvider";
import { price } from "@/lib/format";

/**
 * Cart.
 *
 * Client, because the cart is client state. Note what is NOT here: a running
 * total that the server will trust. The subtotal below is a courtesy to the
 * shopper — app/actions/order.js re-prices every line from the catalogue before
 * the order is created.
 *
 * The delivery fee mirrors the server rule (free over 500 birr) purely so the
 * number does not change at the last step. lib/orders.js remains the single
 * source of truth for the actual charge.
 */
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 60;

export default function CartPage() {
  const { cart, itemCount, subtotal, setQuantity, remove, clear, needsPrescription } =
    useCart();

  if (cart.length === 0) {
    return (
      <main id="main" className="page container">
        <h1 className="mb-6">Your cart</h1>

        <EmptyState
          icon="cart"
          title="Your cart is empty"
          actionHref="/medicines"
          actionLabel="Browse medicines"
          secondaryHref="/prescriptions"
          secondaryLabel="Upload a prescription"
        >
          Nothing has been added yet. Anything marked Rx will need an approved
          prescription before it can be ordered.
        </EmptyState>
      </main>
    );
  }

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const remainingForFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal;

  return (
    <main id="main" className="page container">
      <div className="between mb-6">
        <h1>Your cart</h1>
        <button type="button" className="btn btn--ghost btn--sm" onClick={clear}>
          Empty cart
        </button>
      </div>

      <div className="detail">
        <section aria-label="Cart items">
          <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
            {cart.map((line) => (
              <li key={line.medicineId} className="card card--flush">
                <div className="cluster" style={{ padding: "var(--sp-4)", gap: "var(--sp-4)" }}>
                  <Image
                    src={line.image}
                    alt=""
                    width={80}
                    height={80}
                    sizes="80px"
                    style={{
                      borderRadius: "var(--r)",
                      objectFit: "contain",
                      background: "var(--surface-sunken)",
                    }}
                  />

                  <div style={{ flex: 1, minWidth: "12rem" }}>
                    <h2 className="card__title mb-0" style={{ fontSize: "var(--t-base)" }}>
                      <Link href={`/medicines/${line.medicineId}`}>{line.name}</Link>
                    </h2>
                    <p className="small muted mb-0">
                      {line.strength} · {line.form}
                    </p>
                    {line.requiresPrescription && (
                      <span className="status status--rx mt-2">
                        Prescription required
                      </span>
                    )}
                  </div>

                  <div className="stack" style={{ gap: "var(--sp-2)" }}>
                    <div
                      className="cluster"
                      role="group"
                      aria-label={`Quantity of ${line.name}`}
                    >
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setQuantity(line.medicineId, line.quantity - 1)}
                        aria-label={`Decrease quantity of ${line.name}`}
                      >
                        −
                      </button>

                      <span className="small" aria-live="polite" style={{ minWidth: "2ch", textAlign: "center" }}>
                        {line.quantity}
                      </span>

                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setQuantity(line.medicineId, line.quantity + 1)}
                        disabled={line.quantity >= Math.min(line.stock ?? MAX_PER_LINE, MAX_PER_LINE)}
                        aria-label={`Increase quantity of ${line.name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => remove(line.medicineId)}
                    >
                      Remove
                    </button>
                  </div>

                  <span className="price">{price(line.price * line.quantity)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="card" aria-label="Order summary">
          <h2 className="card__title">Order summary</h2>

          <ul className="spec-list mb-4">
            <li>
              <span className="spec-list__k">Items</span>
              <span>{itemCount}</span>
            </li>
            <li>
              <span className="spec-list__k">Subtotal</span>
              <span>{price(subtotal)}</span>
            </li>
            <li>
              <span className="spec-list__k">Delivery</span>
              <span>{deliveryFee === 0 ? "Free" : price(deliveryFee)}</span>
            </li>
            <li>
              <span className="spec-list__k">Total</span>
              <span>
                <strong>{price(total)}</strong>
              </span>
            </li>
          </ul>

          {deliveryFee > 0 && (
            <p className="small muted mb-4">
              Add {price(remainingForFreeDelivery)} more for free delivery.
            </p>
          )}

          {needsPrescription && (
            <div className="alert alert--warn mb-4">
              <div>
                <p className="alert__title">Prescription required</p>
                <p className="mb-0">
                  This cart contains a prescription-only medicine. You will need
                  an approved prescription before the order can be placed.
                </p>
              </div>
            </div>
          )}

          <Link className="btn btn--primary btn--block" href="/checkout">
            Proceed to checkout
          </Link>

          <Link className="btn btn--ghost btn--block mt-2" href="/medicines">
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
