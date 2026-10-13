"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import Icon from "./Icon";

/**
 * The header cart link — icon, label and a count bubble, as in the reference.
 *
 * This is the smallest useful Client Component in the app: it needs the cart
 * count, which only exists in the browser, so it must be client. Everything
 * around it in the header stays server-rendered.
 *
 * The bubble is only rendered when there is something in the cart. A permanent
 * "0" badge is noise, and it draws the eye to the one number on the page that
 * means "you have nothing".
 */
export default function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link className="cart-pill" href="/cart">
      <span className="cart-pill__icon" aria-hidden="true">
        <Icon name="cart" />
        {itemCount > 0 && (
          <span className="cart-pill__bubble">{itemCount > 99 ? "99+" : itemCount}</span>
        )}
      </span>

      <span className="cart-pill__label">Cart</span>

      <span className="visually-hidden">
        {itemCount === 1 ? "1 item" : `${itemCount} items`}
      </span>
    </Link>
  );
}
