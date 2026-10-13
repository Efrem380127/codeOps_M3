"use client";

import { useCart } from "./CartProvider";
import Icon from "./Icon";

/**
 * Add to cart, with an inline quantity stepper.
 *
 * Two shapes:
 *   - default        a labelled button, used on the detail page and anywhere
 *                    there is room for words.
 *   - variant="round" a circular icon button, used in the product grid where
 *                    the card's foot is already carrying the price. It keeps
 *                    an aria-label, so the accessible name is unaffected by the
 *                    label being invisible.
 *
 * Accessibility decisions worth naming:
 *   - It is a real <button>, not a clickable div.
 *   - When the item is already in the cart the control becomes a labelled
 *     quantity group, so the +/- buttons carry explicit aria-labels rather than
 *     relying on the surrounding context.
 *   - Out of stock disables the button AND sets aria-disabled, so the reason is
 *     available to assistive technology, not just visually greyed out.
 */
export default function AddToCartButton({ medicine, size = "sm", variant = "text" }) {
  const { cart, add, remove, setQuantity } = useCart();

  const line = cart.find((item) => item.medicineId === medicine.id);
  const soldOut = (medicine.stock ?? 0) === 0;
  const round = variant === "round";

  if (soldOut) {
    return round ? (
      <button
        type="button"
        className="add-round add-round--off"
        disabled
        aria-disabled="true"
        aria-label={`${medicine.name} is out of stock`}
        title="This medicine is out of stock"
      >
        <Icon name="close" />
      </button>
    ) : (
      <button
        type="button"
        className="btn btn--outline btn--sm"
        disabled
        aria-disabled="true"
        title="This medicine is out of stock"
      >
        Out of stock
      </button>
    );
  }

  if (!line) {
    return round ? (
      <button
        type="button"
        className="add-round"
        onClick={() => add(medicine, 1)}
        aria-label={`Add ${medicine.name} to cart`}
        title="Add to cart"
      >
        <Icon name="plus" />
      </button>
    ) : (
      <button
        type="button"
        className={`btn btn--primary btn--${size}`}
        onClick={() => add(medicine, 1)}
      >
        Add to cart
      </button>
    );
  }

  const atCeiling = line.quantity >= Math.min(medicine.stock ?? 20, 20);

  return (
    <span className="cluster" role="group" aria-label={`Quantity of ${medicine.name} in cart`}>
      <button
        type="button"
        className="btn btn--outline btn--sm"
        onClick={() => setQuantity(medicine.id, line.quantity - 1)}
        aria-label={
          line.quantity === 1
            ? `Remove ${medicine.name} from cart`
            : `Decrease quantity of ${medicine.name}`
        }
      >
        {line.quantity === 1 ? <Icon name="close" /> : <Icon name="minus" />}
      </button>

      <span className="small" aria-live="polite">
        <strong>{line.quantity}</strong>
        {round ? "" : " in cart"}
      </span>

      <button
        type="button"
        className="btn btn--outline btn--sm"
        onClick={() => setQuantity(medicine.id, line.quantity + 1)}
        disabled={atCeiling}
        aria-label={`Increase quantity of ${medicine.name}`}
      >
        <Icon name="plus" />
      </button>
    </span>
  );
}
