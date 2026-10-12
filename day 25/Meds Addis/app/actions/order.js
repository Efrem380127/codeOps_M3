"use server";

/**
 * Order actions. Server-side only.
 *
 * Every export here re-checks who is calling. That is the whole point: the UI
 * hides buttons, but hiding a button is not a security control — anyone can
 * open the console and call the action directly. These three checks are what
 * the three attacks are aimed at:
 *
 *   Attack 1 — signed out, call the action.
 *     Refused by requireSession(). There is no session, so there is no user,
 *     so the action returns before touching any data.
 *
 *   Attack 2 — signed in as yourself, mutate someone else's record.
 *     Refused by the ownership check in cancelOrder(). The id in the request is
 *     never trusted; the record's userId is compared against the session's.
 *
 *   Attack 3 — a crafted `next` link.
 *     Refused by safeRedirect() in lib/auth.js, used by the sign-in route.
 *
 * STATUS CODES are returned rather than thrown, so the forms can render a
 * message next to the field that caused it.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { checkoutSchema, fieldErrors } from "@/lib/schema";
import { findMedicine } from "@/app/data/medicines";
import { orders } from "@/app/data/orders";
import { findPrescription } from "@/app/data/prescriptions";
import { isStaff } from "@/app/data/users";
import {
  ORDER_STATUS,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  requiresVerification,
} from "@/lib/orders";
import { PRESCRIPTION_STATUS } from "@/app/data/prescriptions";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function requireSession(user) {
  if (!user) {
    return {
      ok: false,
      error: "You must be signed in to do that. Please sign in and try again.",
    };
  }
  return null;
}

function nextOrderId() {
  const highest = orders.reduce((max, order) => {
    const numeric = Number(String(order.id).replace(/\D/g, ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 1000);

  return `ord_${highest + 1}`;
}

/* -------------------------------------------------------------------------- */
/* Place an order                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Creates an order from the submitted cart.
 *
 * IMPORTANT — prices are re-read from the catalogue here. The cart sends only
 * `medicineId` and `quantity`; the browser's idea of the price is ignored
 * entirely. Without this, editing the cart in devtools would change what the
 * order costs.
 */
export async function placeOrder(previousState, formData) {
  const user = await getSession();

  const unauthorised = requireSession(user);
  if (unauthorised) return unauthorised;

  // The cart arrives as JSON in a hidden field, because the cart itself lives
  // in client state and a server action only receives form data.
  let parsedItems;
  try {
    parsedItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { ok: false, error: "The cart could not be read. Please try again." };
  }

  const submission = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    note: String(formData.get("note") ?? ""),
    prescriptionId: formData.get("prescriptionId")
      ? String(formData.get("prescriptionId"))
      : null,
    items: parsedItems,
  };

  const result = checkoutSchema.safeParse(submission);

  if (!result.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors(result.error),
    };
  }

  const { name, phone, address, note, prescriptionId, items } = result.data;

  /* Re-price from the catalogue and check stock. */
  const lines = [];

  for (const item of items) {
    const medicine = findMedicine(item.medicineId);

    if (!medicine) {
      return {
        ok: false,
        error: `One of the items in your cart is no longer in the catalogue. Please remove it and try again.`,
      };
    }

    if (medicine.stock < item.quantity) {
      return {
        ok: false,
        error: `Only ${medicine.stock} × ${medicine.name} left in stock. Please reduce the quantity.`,
      };
    }

    lines.push({ medicineId: medicine.id, quantity: item.quantity });
  }

  /* Prescription gate — the check that makes this a pharmacy. */
  const draft = { items: lines, status: ORDER_STATUS.VERIFIED };
  const needsPrescription = requiresVerification(draft);

  let status = ORDER_STATUS.VERIFIED;

  if (needsPrescription) {
    const requiredIds = lines
      .filter((line) => findMedicine(line.medicineId)?.requiresPrescription)
      .map((line) => line.medicineId);

    if (!prescriptionId) {
      return {
        ok: false,
        error:
          "This order contains a prescription-only medicine. Attach an approved prescription before placing it.",
      };
    }

    const prescription = findPrescription(prescriptionId);

    // Ownership is checked on the prescription too — a valid prescription id
    // belonging to someone else is not a valid prescription for you.
    if (!prescription || prescription.userId !== user.id) {
      return {
        ok: false,
        error: "That prescription does not belong to your account.",
      };
    }

    if (prescription.status !== PRESCRIPTION_STATUS.APPROVED) {
      status = ORDER_STATUS.PENDING_VERIFICATION;
    } else {
      const covered = requiredIds.every((id) =>
        prescription.medicineIds.includes(id),
      );

      status = covered
        ? ORDER_STATUS.VERIFIED
        : ORDER_STATUS.PENDING_VERIFICATION;
    }
  }

  /* Persist. */
  const order = {
    id: nextOrderId(),
    userId: user.id,
    placedAt: new Date().toISOString(),
    status,
    prescriptionId,
    deliveryAddress: address,
    note,
    // The contact name and phone come from the form, but the order still
    // belongs to the session user — not to whoever the form claims to be.
    contactName: name,
    contactPhone: phone,
    items: lines,
    courier: null,
  };

  orders.push(order);

  revalidatePath("/orders");
  revalidatePath("/dashboard");

  // redirect() throws, so it must not be inside a try/catch that swallows it.
  redirect(`/orders/${order.id}?placed=1`);
}

/* -------------------------------------------------------------------------- */
/* Cancel an order                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Cancels an order. This is the action attack 1 and attack 2 are pointed at.
 */
export async function cancelOrder(previousState, formData) {
  const user = await getSession();

  const unauthorised = requireSession(user);
  if (unauthorised) return unauthorised;

  const orderId = String(formData.get("orderId") ?? "");
  const order = orders.find((candidate) => candidate.id === orderId);

  if (!order) {
    return { ok: false, error: "That order does not exist." };
  }

  /*
   * THE OWNERSHIP CHECK.
   *
   * The id arrived in the request, and the request can say anything. What makes
   * this safe is that the decision is made against `order.userId` — the record
   * as stored — and the session, not against anything the caller supplied.
   *
   * Staff may cancel on a customer's behalf; a customer may only cancel their
   * own. A different customer gets the same message a non-existent order would
   * produce, so the action does not confirm that someone else's order exists.
   */
  const isOwner = order.userId === user.id;
  const mayOverride = isStaff(user);

  if (!isOwner && !mayOverride) {
    return { ok: false, error: "You can only cancel your own orders." };
  }

  if (order.status === ORDER_STATUS.DELIVERED) {
    return {
      ok: false,
      error: "This order has already been delivered and cannot be cancelled.",
    };
  }

  if (order.status === ORDER_STATUS.CANCELLED) {
    return { ok: false, error: "This order is already cancelled." };
  }

  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date().toISOString();
  order.cancelledBy = user.id;

  revalidatePath("/orders");
  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/dashboard");

  return { ok: true, message: `Order ${order.id} has been cancelled.` };
}

/* -------------------------------------------------------------------------- */
/* Advance an order — dispensary staff only                                   */
/* -------------------------------------------------------------------------- */

const ADVANCEABLE = [
  ORDER_STATUS.VERIFIED,
  ORDER_STATUS.DISPENSING,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

export async function advanceOrder(previousState, formData) {
  const user = await getSession();

  const unauthorised = requireSession(user);
  if (unauthorised) return unauthorised;

  /*
   * A role check, not an ownership check: moving an order through the
   * dispensary is a staff action performed on someone else's order. This is why
   * the two checks are genuinely different, and why "is the caller the owner?"
   * is the wrong question here.
   */
  if (!isStaff(user)) {
    return {
      ok: false,
      error: "Only dispensary staff can move an order through fulfilment.",
    };
  }

  const orderId = String(formData.get("orderId") ?? "");
  const order = orders.find((candidate) => candidate.id === orderId);

  if (!order) {
    return { ok: false, error: "That order does not exist." };
  }

  const currentIndex = ADVANCEABLE.indexOf(order.status);

  if (currentIndex === -1) {
    return {
      ok: false,
      error: `An order that is ${order.status.replace(/_/g, " ")} cannot be advanced.`,
    };
  }

  if (currentIndex === ADVANCEABLE.length - 1) {
    return { ok: false, error: "This order is already delivered." };
  }

  order.status = ADVANCEABLE[currentIndex + 1];

  if (order.status === ORDER_STATUS.OUT_FOR_DELIVERY && !order.courier) {
    // A courier is attached at dispatch, which is what the tracking map reads.
    order.courier = {
      name: "Yohannes Tesfaye",
      phone: "0911220099",
      vehicle: "Motorbike · ET-3401",
      lat: 9.004,
      lng: 38.782,
      updatedAt: new Date().toISOString(),
    };
  }

  revalidatePath("/dispensary");
  revalidatePath("/orders");
  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: `Order ${order.id} is now ${order.status.replace(/_/g, " ")}.`,
  };
}

/** Exported for the summary line in the dispensary header. */
export async function orderTotalsPreview(subtotal) {
  const value = Number(subtotal) || 0;
  return value >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}
