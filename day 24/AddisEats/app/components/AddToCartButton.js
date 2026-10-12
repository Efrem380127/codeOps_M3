"use client";

import { useCart } from "./CartProvider";
import { MAX_QUANTITY } from "../lib/cart";

/**
 * Add-to-cart control for a single dish.
 *
 * Extracted from FoodCard, which had this markup inline. The dish detail page
 * needs the same control with the same labels and the same cap, and two copies
 * of that logic is how the two drift — one ends up enforcing a different
 * quantity limit, or loses the "Limit reached" state.
 *
 * The label carries the current quantity rather than showing a separate badge:
 * "Add more (3)" tells the visitor both what the button does and what they
 * already have, in the place they are already looking.
 */
export default function AddToCartButton({ dish, className = "btn btn-primary" }) {
  const { items, addItem } = useCart();
  const quantity = items.find((item) => item.id === dish.id)?.quantity || 0;
  const atLimit = quantity >= MAX_QUANTITY;

  return (
    <button
      type="button"
      className={className}
      onClick={() => addItem(dish.id)}
      disabled={atLimit}
      aria-label={`Add ${dish.name} to cart`}
    >
      {atLimit ? "Limit reached" : quantity > 0 ? `Add more (${quantity})` : "+ Add"}
    </button>
  );
}
