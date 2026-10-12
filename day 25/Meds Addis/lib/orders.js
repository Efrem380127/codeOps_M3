/**
 * Meds Addis — order logic.
 *
 * The important idea in this file: an order does not store money. It stores
 * lines of { medicineId, quantity }, and the money is derived from the
 * catalogue every time it is read. A price change therefore cannot leave a
 * stored total disagreeing with the product table.
 *
 * `hydrateOrder` is the single place that turns a stored order into the shape
 * the UI renders, so the order list, the order detail page and the CSV export
 * can never disagree about what an order cost.
 */

import { orders } from "@/app/data/orders";
import { findMedicine } from "@/app/data/medicines";

export const ORDER_STATUS = {
  PENDING_VERIFICATION: "pending_verification",
  VERIFIED: "verified",
  DISPENSING: "dispensing",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

/** The happy path. A cancelled order leaves this line entirely. */
export const ORDER_FLOW = [
  ORDER_STATUS.PENDING_VERIFICATION,
  ORDER_STATUS.VERIFIED,
  ORDER_STATUS.DISPENSING,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING_VERIFICATION]: "Awaiting pharmacist",
  [ORDER_STATUS.VERIFIED]: "Verified",
  [ORDER_STATUS.DISPENSING]: "Being dispensed",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for delivery",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

/** Badge class per status, so the colour is decided in one place. */
export const ORDER_STATUS_BADGE = {
  [ORDER_STATUS.PENDING_VERIFICATION]: "badge--rx",
  [ORDER_STATUS.VERIFIED]: "badge--info",
  [ORDER_STATUS.DISPENSING]: "badge--info",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "badge--info",
  [ORDER_STATUS.DELIVERED]: "badge--ok",
  [ORDER_STATUS.CANCELLED]: "badge--out",
};

export const DELIVERY_FEE = 60;
export const FREE_DELIVERY_THRESHOLD = 500;

const SIMULATED_LATENCY_MS = 250;

function wait() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
}

/* -------------------------------------------------------------------------- */
/* Derivation                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Resolve an order's lines against the catalogue.
 *
 * A line whose medicine no longer exists is kept, flagged `missing`, and priced
 * at zero rather than being silently dropped — an order that quietly loses a
 * line is worse than one that admits it.
 */
export function orderLines(order) {
  return (order?.items ?? []).map((item) => {
    const medicine = findMedicine(item.medicineId);
    const unitPrice = medicine?.price ?? 0;

    return {
      medicineId: item.medicineId,
      name: medicine?.name ?? "Unavailable item",
      strength: medicine?.strength ?? "",
      form: medicine?.form ?? "",
      requiresPrescription: Boolean(medicine?.requiresPrescription),
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      missing: !medicine,
    };
  });
}

/** Subtotal, delivery fee and grand total for an order. */
export function orderTotals(order) {
  const lines = orderLines(order);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  const deliveryFee =
    order?.status === ORDER_STATUS.CANCELLED ||
    subtotal === 0 ||
    subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_FEE;

  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}

/** The stored order plus everything derived from it. */
export function hydrateOrder(order) {
  if (!order) return null;

  const lines = orderLines(order);
  const totals = orderTotals(order);

  return {
    ...order,
    lines,
    ...totals,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    statusLabel: ORDER_STATUS_LABEL[order.status] ?? order.status,
    statusBadge: ORDER_STATUS_BADGE[order.status] ?? "badge--neutral",
    needsVerification: lines.some((line) => line.requiresPrescription),
    isCancellable:
      order.status !== ORDER_STATUS.CANCELLED &&
      order.status !== ORDER_STATUS.DELIVERED,
  };
}

/** True when any line is prescription-only. This gates the whole order. */
export function requiresVerification(order) {
  return orderLines(order).some((line) => line.requiresPrescription);
}

/** The next step on the happy path, or null at the end of it. */
export function nextStatus(status) {
  const index = ORDER_FLOW.indexOf(status);
  if (index === -1 || index === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[index + 1];
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                      */
/* -------------------------------------------------------------------------- */

const byNewest = (a, b) => b.placedAt.localeCompare(a.placedAt);

export async function getOrders() {
  await wait();
  return [...orders].sort(byNewest).map(hydrateOrder);
}

export async function getOrdersForUser(userId) {
  await wait();
  return orders
    .filter((order) => order.userId === userId)
    .sort(byNewest)
    .map(hydrateOrder);
}

export async function getOrderById(id) {
  await wait();
  return hydrateOrder(orders.find((order) => order.id === id) ?? null);
}

/** Synchronous variant for the SSE stream, which polls on a timer. */
export function readOrder(id) {
  return hydrateOrder(orders.find((order) => order.id === id) ?? null);
}

/** Ownership check used by the server actions. */
export function isOwnedBy(order, userId) {
  return Boolean(order) && order.userId === userId;
}

/* -------------------------------------------------------------------------- */
/* Aggregates — the manager dashboard                                         */
/* -------------------------------------------------------------------------- */

/** Orders per day, oldest first, with gaps filled so the line chart is honest. */
export function ordersByDay(list = orders, days = 14) {
  const buckets = new Map();

  const end = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(end);
    day.setDate(end.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    buckets.set(key, { date: key, orders: 0, revenue: 0 });
  }

  for (const order of list) {
    if (order.status === ORDER_STATUS.CANCELLED) continue;

    const key = order.placedAt.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;

    bucket.orders += 1;
    bucket.revenue += orderTotals(order).total;
  }

  return [...buckets.values()];
}

/** Revenue grouped by therapeutic category. */
export function revenueByCategory(list = orders) {
  const totals = new Map();

  for (const order of list) {
    if (order.status === ORDER_STATUS.CANCELLED) continue;

    for (const line of orderLines(order)) {
      const medicine = findMedicine(line.medicineId);
      if (!medicine) continue;

      const current = totals.get(medicine.category) ?? 0;
      totals.set(medicine.category, current + line.lineTotal);
    }
  }

  return [...totals.entries()]
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Headline numbers for the stat tiles. */
export function orderSummary(list = orders) {
  const active = list.filter((order) => order.status !== ORDER_STATUS.CANCELLED);

  const revenue = active.reduce((sum, order) => sum + orderTotals(order).total, 0);

  const awaitingVerification = list.filter(
    (order) => order.status === ORDER_STATUS.PENDING_VERIFICATION,
  ).length;

  const inTransit = list.filter(
    (order) => order.status === ORDER_STATUS.OUT_FOR_DELIVERY,
  ).length;

  return {
    orderCount: active.length,
    revenue,
    averageOrderValue: active.length === 0 ? 0 : revenue / active.length,
    awaitingVerification,
    inTransit,
    cancelled: list.length - active.length,
  };
}
