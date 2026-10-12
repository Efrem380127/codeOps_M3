/**
 * Meds Addis — prescription access.
 *
 * A prescription is the pharmacist's authorisation. This module is the read
 * side; the write side (approve / reject) lives in app/actions/prescription.js
 * and re-checks the role there, because hiding a button is not a security
 * control.
 */

import {
  prescriptions,
  findPrescription,
  prescriptionsForUser,
  pendingPrescriptions,
  PRESCRIPTION_STATUS,
} from "@/app/data/prescriptions";
import { findUserById } from "@/app/data/users";
import { findMedicine } from "@/app/data/medicines";

export { PRESCRIPTION_STATUS };

export const PRESCRIPTION_STATUS_LABEL = {
  [PRESCRIPTION_STATUS.PENDING]: "Awaiting review",
  [PRESCRIPTION_STATUS.APPROVED]: "Approved",
  [PRESCRIPTION_STATUS.REJECTED]: "Rejected",
};

export const PRESCRIPTION_STATUS_BADGE = {
  [PRESCRIPTION_STATUS.PENDING]: "badge--rx",
  [PRESCRIPTION_STATUS.APPROVED]: "badge--ok",
  [PRESCRIPTION_STATUS.REJECTED]: "badge--out",
};

const SIMULATED_LATENCY_MS = 200;

function wait() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
}

/** Adds display fields the raw record does not carry. */
export function hydratePrescription(rx) {
  if (!rx) return null;

  const reviewer = rx.reviewedBy ? findUserById(rx.reviewedBy) : null;

  return {
    ...rx,
    statusLabel: PRESCRIPTION_STATUS_LABEL[rx.status] ?? rx.status,
    statusBadge: PRESCRIPTION_STATUS_BADGE[rx.status] ?? "badge--neutral",
    reviewerName: reviewer?.name ?? null,
    medicines: (rx.medicineIds ?? [])
      .map((id) => findMedicine(id))
      .filter(Boolean)
      .map((medicine) => ({
        id: medicine.id,
        name: medicine.name,
        strength: medicine.strength,
      })),
  };
}

export async function getPrescriptionsForUser(userId) {
  await wait();
  return prescriptionsForUser(userId).map(hydratePrescription);
}

/** The pharmacist's work queue, oldest first — first in, first reviewed. */
export async function getPendingPrescriptions() {
  await wait();
  return pendingPrescriptions().map(hydratePrescription);
}

/** Every prescription, newest first. Dispensary history + dashboard counts. */
export async function getAllPrescriptions() {
  await wait();
  return [...prescriptions]
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .map(hydratePrescription);
}

export async function getPrescriptionById(id) {
  await wait();
  return hydratePrescription(findPrescription(id));
}

export function isOwnedBy(rx, userId) {
  return Boolean(rx) && rx.userId === userId;
}

/**
 * Does this user hold an approved prescription covering every
 * prescription-only medicine in the list?
 *
 * This is the check that decides whether a prescription-only order may skip the
 * pharmacist queue — and it is enforced on the server, in the order action, not
 * in the cart.
 */
export function coversMedicines(prescription, medicineIds) {
  if (!prescription) return false;
  if (prescription.status !== PRESCRIPTION_STATUS.APPROVED) return false;

  return medicineIds.every((id) => prescription.medicineIds.includes(id));
}

export function prescriptionCounts() {
  return {
    pending: prescriptions.filter(
      (rx) => rx.status === PRESCRIPTION_STATUS.PENDING,
    ).length,
    approved: prescriptions.filter(
      (rx) => rx.status === PRESCRIPTION_STATUS.APPROVED,
    ).length,
    rejected: prescriptions.filter(
      (rx) => rx.status === PRESCRIPTION_STATUS.REJECTED,
    ).length,
  };
}
