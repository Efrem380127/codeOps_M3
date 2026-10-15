"use server";

import { revalidatePath } from "next/cache";
import { validate } from "../lib/validate";
import { orders } from "../data/orders";
import { dishes } from "../data/dishes";
import { resolveCartItems, getCartTotals } from "../lib/cart";
import { getSession } from "@/lib/auth";

/**
 * Read the cart the checkout form submitted.
 *
 * The form sends `[{ id, quantity }]` and nothing else that matters. Prices are
 * resolved from the catalogue on this side: a client that is allowed to send
 * its own price is a client that can set its own price.
 *
 * A malformed payload returns an error rather than an empty cart, because
 * silently ordering nothing is the worse failure.
 */
function readSelection(formData) {
  const raw = formData.get("items");
  if (!raw) return { selection: [], error: "Your cart is empty." };

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { selection: [], error: "Your cart is empty." };
    }
    return { selection: parsed, error: null };
  } catch {
    return {
      selection: [],
      error: "Your cart could not be read. Reload the page and add your dishes again."
    };
  }
}

export async function placeOrder(prevState, formData) {
  const data = {
    name: formData.get("name") || "",
    phone: formData.get("phone") || "",
    area: formData.get("area") || "",
    notes: formData.get("notes") || ""
  };

  const fieldErrors = validate(data);

  const { selection, error: cartError } = readSelection(formData);

  let lines = [];
  if (!cartError) {
    try {
      // Throws with a visitor-readable message on an unknown dish, a duplicate,
      // or a quantity outside 1..MAX_QUANTITY.
      lines = resolveCartItems(selection, dishes);
    } catch (error) {
      fieldErrors.items = error.message;
    }
  } else {
    fieldErrors.items = cartError;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      data,
      success: false
    };
  }

  const totals = getCartTotals(lines);

  const session = await getSession();
  const sessionUser = session?.name || data.name;
  const sessionId = session?.id || "guest";

  const order = {
    id: String(Date.now()),
    ...data,
    userId: sessionId,
    sessionId: sessionId,
    owner: sessionUser,
    status: "confirmed",
    // The lines and the money, so the order carries what was actually bought.
    // Without these the order list, the order status page and the revenue
    // charts all showed a blank total for every order placed through checkout.
    items: lines.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    createdAt: new Date().toISOString()
  };

  orders.push(order);

  revalidatePath("/checkout");
  revalidatePath("/orders");
  revalidatePath("/kitchen");

  return {
    success: true,
    order,
    fieldErrors: {}
  };
}

export const createOrder = placeOrder;

export async function cancelOrder(orderId) {
  const session = await getSession();

  if (!session) {
    return { error: "Unauthorized: No active session" };
  }

  const order = orders.find((o) => String(o.id) === String(orderId));
  if (!order) {
    return { error: "Order not found" };
  }

  if (order.sessionId !== session.id && order.owner !== session.name && session.role !== "staff") {
    return { error: "Forbidden: Not the record owner" };
  }

  order.status = "cancelled";
  revalidatePath("/checkout");
  revalidatePath("/orders");
  return { success: true, order };
}
