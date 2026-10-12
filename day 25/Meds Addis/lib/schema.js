/**
 * Meds Addis — validation schemas (Zod).
 *
 * These run on the SERVER, inside the route handlers and server actions. The
 * client may run the same schema for instant feedback, but the server never
 * trusts that it did — a form is a convenience, not a control.
 *
 * Note the phone pattern: Ethiopian mobile numbers are 10 digits starting 09.
 * Validating it here means the fixture data, the checkout form and the
 * prescription form cannot drift apart.
 */

import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^09\d{8}$/, "Enter a mobile number as 09XXXXXXXX");

const trimmed = (min, max, label) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be under ${max} characters`);

/* -------------------------------------------------------------------------- */
/* Sign in                                                                    */
/* -------------------------------------------------------------------------- */

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // Optional and validated again by safeRedirect() — this only catches the
  // obvious case early.
  next: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/* Checkout                                                                   */
/* -------------------------------------------------------------------------- */

export const cartLineSchema = z.object({
  medicineId: z.string().trim().min(1, "Missing medicine reference"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1")
    .max(20, "Maximum 20 units per item without a pharmacist's approval"),
});

export const checkoutSchema = z.object({
  name: trimmed(2, 100, "Full name"),
  phone,
  address: trimmed(8, 200, "Delivery address"),
  note: z.string().trim().max(300, "Note must be under 300 characters").optional(),
  prescriptionId: z.string().trim().min(1).nullable().optional(),
  items: z
    .array(cartLineSchema)
    .min(1, "Your cart is empty")
    .max(30, "Too many distinct items in one order"),
});

/* -------------------------------------------------------------------------- */
/* Prescription upload                                                        */
/* -------------------------------------------------------------------------- */

export const prescriptionSchema = z.object({
  patientName: trimmed(2, 100, "Patient name"),
  prescriberName: trimmed(2, 100, "Prescriber name"),
  prescriberLicence: z
    .string()
    .trim()
    .min(4, "Prescriber licence number is required")
    .max(40),
  facility: trimmed(2, 120, "Facility"),
  issuedAt: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Issued date must be YYYY-MM-DD"),
  notes: z.string().trim().max(500, "Notes must be under 500 characters").optional(),
  medicineIds: z
    .array(z.string().trim().min(1))
    .min(1, "Select at least one medicine this prescription covers"),
  fileName: trimmed(1, 160, "File name"),
});

/* -------------------------------------------------------------------------- */
/* Pharmacist decision                                                        */
/* -------------------------------------------------------------------------- */

export const reviewSchema = z
  .object({
    decision: z.enum(["approve", "reject"]),
    note: z.string().trim().max(500).optional(),
  })
  .refine((value) => value.decision !== "reject" || (value.note ?? "").length >= 10, {
    message:
      "A rejection needs a reason of at least 10 characters so the patient knows what to fix",
    path: ["note"],
  });

/* -------------------------------------------------------------------------- */
/* Order status transitions                                                   */
/* -------------------------------------------------------------------------- */

export const advanceSchema = z.object({
  orderId: z.string().trim().min(1),
});

/* -------------------------------------------------------------------------- */
/* Helper                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Flattens a ZodError into `{ field: "first message" }` — the shape the forms
 * render next to each input.
 */
export function fieldErrors(error) {
  const flat = {};

  for (const issue of error?.issues ?? []) {
    const key = issue.path.join(".") || "_form";
    if (!flat[key]) flat[key] = issue.message;
  }

  return flat;
}
