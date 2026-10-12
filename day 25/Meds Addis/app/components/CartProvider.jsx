"use client";

/**
 * Cart state.
 *
 * Client-only by design: the cart lives in memory until checkout, and the server
 * never sees it until then. That is also why nothing here is trusted later —
 * `app/actions/order.js` re-reads every price from the catalogue, so a tampered
 * cart cannot change what an order costs.
 *
 * Keyed by `medicineId`, with a quantity — not an array of duplicate entries.
 * Two of the same medicine is one line with quantity 2, which is what the
 * order, the CSV export and the dispensary all expect.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";

const CartContext = createContext(null);

const MAX_PER_LINE = 20;

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const { medicine, quantity } = action;
      const existing = state.find((line) => line.medicineId === medicine.id);

      // Never let a line exceed what is on the shelf, or the per-line cap.
      const ceiling = Math.min(medicine.stock ?? MAX_PER_LINE, MAX_PER_LINE);

      if (existing) {
        return state.map((line) =>
          line.medicineId === medicine.id
            ? {
                ...line,
                quantity: Math.min(ceiling, line.quantity + quantity),
              }
            : line,
        );
      }

      return [
        ...state,
        {
          medicineId: medicine.id,
          name: medicine.name,
          strength: medicine.strength,
          form: medicine.form,
          image: medicine.image,
          price: medicine.price,
          stock: medicine.stock,
          requiresPrescription: Boolean(medicine.requiresPrescription),
          quantity: Math.min(ceiling, quantity),
        },
      ];
    }

    case "setQuantity": {
      const { medicineId, quantity } = action;

      if (quantity <= 0) {
        return state.filter((line) => line.medicineId !== medicineId);
      }

      return state.map((line) =>
        line.medicineId === medicineId
          ? {
              ...line,
              quantity: Math.min(
                Math.min(line.stock ?? MAX_PER_LINE, MAX_PER_LINE),
                quantity,
              ),
            }
          : line,
      );
    }

    case "remove":
      return state.filter((line) => line.medicineId !== action.medicineId);

    case "clear":
      return [];

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(reducer, []);

  const add = useCallback(
    (medicine, quantity = 1) => dispatch({ type: "add", medicine, quantity }),
    [],
  );

  const remove = useCallback(
    (medicineId) => dispatch({ type: "remove", medicineId }),
    [],
  );

  const setQuantity = useCallback(
    (medicineId, quantity) =>
      dispatch({ type: "setQuantity", medicineId, quantity }),
    [],
  );

  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo(() => {
    const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = cart.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0,
    );
    const needsPrescription = cart.some((line) => line.requiresPrescription);

    return {
      cart,
      add,
      remove,
      setQuantity,
      clear,
      itemCount,
      subtotal,
      needsPrescription,
      isEmpty: cart.length === 0,
    };
  }, [cart, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error("useCart must be used inside a <CartProvider>");
  }

  return context;
}

export { MAX_PER_LINE };
