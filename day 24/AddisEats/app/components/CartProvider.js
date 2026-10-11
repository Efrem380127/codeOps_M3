"use client";

import { createContext, useContext, useState } from "react";

const CartContext = createContext({ items: [], setItems: () => {}, itemCount: 0 });

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const itemCount = (items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ items, setItems, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
