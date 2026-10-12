"use server";

/**
 * Prescription actions. Server-side only.
 *
 * The upload path is open to any signed-in user; the review path is restricted
 * to pharmacists. Two different checks for two different operations, and both
 * live here rather than in the UI.
 *
 * Note the ownership rule on upload: the prescription is created with
 * `userId: user.id` from the session. The form never sends a user id, so there
 * is nothing for a caller to tamper with.
 */

import { revalidatePath } from "next/cache";

import { getSession, getPharmacistSession } from "@/lib/session";
import { prescriptionSchema, reviewSchema, fieldErrors } from "@/lib/schema";
import { prescriptions, PRESCRIPTION_STATUS } from "@/app/data/prescriptions";
import { findMedicine } from "@/app/data/medicines";

function nextPrescriptionId() {
  const highest = prescriptions.reduce((max, rx) => {
    const numeric = Number(String(rx.id).replace(/\D/g, ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 5000);

  return `rx_${highest + 1}`;
}

/* -------------------------------------------------------------------------- */
/* Upload                                                                     */
/* -------------------------------------------------------------------------- */

export async function uploadPrescription(previousState, formData) {
  const user = await getSession();

  if (!user) {
    return {
      ok: false,
      error: "Sign in before uploading a prescription.",
    };
  }

  // medicineIds arrives as repeated form fields.
  const medicineIds = formData.getAll("medicineIds").map(String).filter(Boolean);

  const submission = {
    patientName: String(formData.get("patientName") ?? ""),
    prescriberName: String(formData.get("prescriberName") ?? ""),
    prescriberLicence: String(formData.get("prescriberLicence") ?? ""),
    facility: String(formData.get("facility") ?? ""),
    issuedAt: String(formData.get("issuedAt") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    medicineIds,
    fileName: String(formData.get("fileName") ?? ""),
  };

  const result = prescriptionSchema.safeParse(submission);

  if (!result.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors(result.error),
    };
  }

  const data = result.data;

  // Reject ids that are not in the catalogue, rather than storing them.
  const unknown = data.medicineIds.filter((id) => !findMedicine(id));

  if (unknown.length > 0) {
    return {
      ok: false,
      error: "That prescription names a medicine which is not in the catalogue.",
    };
  }

  const prescription = {
    id: nextPrescriptionId(),
    // From the session, never from the form.
    userId: user.id,
    patientName: data.patientName,
    prescriberName: data.prescriberName,
    prescriberLicence: data.prescriberLicence,
    facility: data.facility,
    issuedAt: new Date(`${data.issuedAt}T09:00:00.000Z`).toISOString(),
    fileName: data.fileName,
    notes: data.notes ?? "",
    medicineIds: data.medicineIds,
    status: PRESCRIPTION_STATUS.PENDING,
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
    uploadedAt: new Date().toISOString(),
  };

  prescriptions.push(prescription);

  revalidatePath("/prescriptions");
  revalidatePath("/dispensary");

  return {
    ok: true,
    message: `Prescription ${prescription.id} uploaded. A pharmacist will review it, usually within the hour.`,
    prescriptionId: prescription.id,
  };
}

/* -------------------------------------------------------------------------- */
/* Review — pharmacist only                                                   */
/* -------------------------------------------------------------------------- */

export async function reviewPrescription(previousState, formData) {
  /*
   * This is the check attack 1 and attack 2 are pointed at for prescriptions.
   * A signed-out caller has no session; a signed-in customer has a session but
   * not the pharmacist role. Both are refused here, before any write.
   */
  const pharmacist = await getPharmacistSession();

  if (!pharmacist) {
    return {
      ok: false,
      error:
        "Only a signed-in pharmacist can approve or reject a prescription.",
    };
  }

  const prescriptionId = String(formData.get("prescriptionId") ?? "");
  const prescription = prescriptions.find((rx) => rx.id === prescriptionId);

  if (!prescription) {
    return { ok: false, error: "That prescription does not exist." };
  }

  const result = reviewSchema.safeParse({
    decision: String(formData.get("decision") ?? ""),
    note: String(formData.get("note") ?? ""),
  });

  if (!result.success) {
    return {
      ok: false,
      error: "The decision could not be recorded.",
      fieldErrors: fieldErrors(result.error),
    };
  }

  const { decision, note } = result.data;

  prescription.status =
    decision === "approve"
      ? PRESCRIPTION_STATUS.APPROVED
      : PRESCRIPTION_STATUS.REJECTED;

  // Recorded from the session, so the audit trail cannot be forged.
  prescription.reviewedBy = pharmacist.id;
  prescription.reviewedAt = new Date().toISOString();
  prescription.reviewNote = note ?? null;

  revalidatePath("/dispensary");
  revalidatePath("/prescriptions");
  revalidatePath("/orders");

  return {
    ok: true,
    message:
      decision === "approve"
        ? `Prescription ${prescription.id} approved.`
        : `Prescription ${prescription.id} rejected and the patient notified.`,
  };
}
