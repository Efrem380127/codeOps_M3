"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import Icon from "./Icon";

/**
 * The header cart link.
 *
 * This is the smallest useful Client Component in the app: it needs the cart
 * count, which only exists in the browser, so it must be client. Everything
 * around it in the header stays server-rendered.
 */
export default function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link className="cart-pill" href="/cart">
      <Icon name="cart" />
      <span className="visually-hidden">Cart,</span>
      <span className="cart-pill__count" aria-hidden="true">
        {itemCount}
      </span>
      {/*
        The visible count is aria-hidden and this live region carries the same
        number as words, so a screen reader announces "Cart, 3 items" once
        instead of reading a bare digit with no context.
      */}
      <span className="visually-hidden">
        {itemCount === 1 ? "1 item" : `${itemCount} items`}
      </span>
    </Link>
  );
}
