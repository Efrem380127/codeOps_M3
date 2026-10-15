"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { dishes } from "../data/dishes";
import { MAX_QUANTITY, getCartTotals } from "../lib/cart";

/**
 * The cart.
 *
 * This context was a stub for most of the project's life. It exposed only
 * `items`, `setItems` and `itemCount`, while its three consumers were written
 * against a much larger API: `AddToCartButton` called `addItem`, and
 * `CartContents` read `subtotal`, `deliveryFee`, `total`, `updateQuantity` and
 * `removeItem`. None of those existed, so pressing "+ Add" threw
 * `addItem is not a function` (minified to "l is not a function" in
 * production) and the cart page rendered `undefined ETB` behind buttons that
 * threw when pressed.
 *
 * The API below is the one the consumers were already written against.
 *
 * A line holds the whole dish, not just an id and a quantity. The cart page
 * renders the name, the image and the unit price, and a line that has to look
 * its dish up on every render is a line that breaks the moment the lookup
 * misses.
 *
 * The basket survives a reload by way of `sessionStorage`, which is per tab and
 * dies with it. A cart that empties on refresh reads as a broken cart, and the
 * visitor has no way to tell the difference between "I lost my basket" and
 * "the site does not work". Prices are never restored from storage: only ids
 * and quantities are stored, and every line is re-priced from the catalogue on
 * the way back in, so a basket saved last week cannot check out at last week's
 * price.
 */

const STORAGE_KEY = "addis-eats-cart";

const EMPTY_CART = {
  items: [],
  setItems: () => {},
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clear: () => {},
  itemCount: 0,
  subtotal: 0,
  deliveryFee: 0,
  total: 0
};

const CartContext = createContext(EMPTY_CART);

/** Rebuild stored lines against the catalogue. Unknown dishes are dropped. */
function restoreLines(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((line) => {
        const dish = dishes.find((entry) => String(entry.id) === String(line?.id));
        if (!dish) return null;
        const quantity = Number(line?.quantity);
        if (!Number.isFinite(quantity)) return null;
        return {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity)))
        };
      })
      .filter(Boolean);
  } catch {
    // A corrupt entry is not worth an error boundary; start empty instead.
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const hydrated = useRef(false);

  /**
   * One effect, two jobs, and the order matters. It restores on the first run
   * and persists on every run after that. Two separate effects would let the
   * persist half fire on mount, before the restore has been applied, writing
   * an empty basket over a good one.
   */
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      let raw = null;
      try {
        raw = sessionStorage.getItem(STORAGE_KEY);
      } catch {
        // Storage can be unavailable; an in-memory cart is still a working one.
      }
      const restored = restoreLines(raw);
      if (restored.length) setItems(restored);
      return;
    }

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items.map(({ id, quantity }) => ({ id, quantity })))
      );
    } catch {
      // Quota or a blocked store is not a reason to break the cart.
    }
  }, [items]);

  /**
   * Add one portion of a dish.
   *
   * Takes an id rather than an object, because that is how both call sites
   * already invoke it. The catalogue is the single source of truth for the
   * name, the image and the price, so a line in the cart cannot drift from the
   * menu it was taken from.
   */
  const addItem = useCallback((id) => {
    setItems((current) => {
      const dish = dishes.find((entry) => String(entry.id) === String(id));
      if (!dish) return current;

      const existing = current.find((item) => item.id === dish.id);
      if (!existing) {
        return [
          ...current,
          {
            id: dish.id,
            name: dish.name,
            price: dish.price,
            image: dish.image,
            quantity: 1
          }
        ];
      }

      // The cap is enforced here as well as on the button, because the button
      // is not the only thing that can reach this function.
      if (existing.quantity >= MAX_QUANTITY) return current;

      return current.map((item) =>
        item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
  }, []);

  /** Set an absolute quantity. Clamped to 1..MAX_QUANTITY; never removes. */
  const updateQuantity = useCallback((id, quantity) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const next = Number.isFinite(Number(quantity)) ? Math.trunc(Number(quantity)) : 1;
        return { ...item, quantity: Math.min(MAX_QUANTITY, Math.max(1, next)) };
      })
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    // One implementation of the arithmetic, shared with the server action that
    // prices the order. Two copies of it is how a cart and an invoice end up
    // disagreeing about the same basket.
    const totals = getCartTotals(items);
    return { items, setItems, addItem, updateQuantity, removeItem, clear, ...totals };
  }, [items, addItem, updateQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

