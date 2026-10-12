/**
 * Meds Addis — prescriptions.
 *
 * A prescription is the authorisation a pharmacist checks before a
 * prescription-only medicine can be dispensed. The lifecycle is:
 *
 *   pending -> approved | rejected
 *
 * Only a user with role "pharmacist" may move it out of "pending", and that
 * check lives in app/actions/prescription.js on the server — the dispensary UI
 * merely hides the buttons.
 */

export const PRESCRIPTION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const prescriptions = [
  {
    id: "rx_5001",
    userId: "usr_abebe",
    patientName: "Abebe Bikila",
    prescriberName: "Dr. Tigist Wolde",
    prescriberLicence: "EFDA-MD-2015-8823",
    facility: "Black Lion Hospital",
    issuedAt: "2026-09-28T09:15:00.000Z",
    fileName: "amoxicillin-course.pdf",
    notes:
      "Acute bacterial sinusitis. Amoxicillin 500 mg three times daily for seven days.",
    medicineIds: ["med_001"],
    status: PRESCRIPTION_STATUS.APPROVED,
    reviewedBy: "usr_meron",
    reviewedAt: "2026-09-28T11:40:00.000Z",
    reviewNote: "Prescriber licence verified against the EFDA register.",
    uploadedAt: "2026-09-28T10:02:00.000Z",
  },
  {
    id: "rx_5002",
    userId: "usr_sara",
    patientName: "Sara Tesfaye",
    prescriberName: "Dr. Yonas Girma",
    prescriberLicence: "EFDA-MD-2012-3390",
    facility: "Zewditu Memorial Hospital",
    issuedAt: "2026-10-04T08:00:00.000Z",
    fileName: "metformin-repeat.jpg",
    notes: "Type 2 diabetes, repeat prescription. Metformin 850 mg twice daily with meals.",
    medicineIds: ["med_008"],
    status: PRESCRIPTION_STATUS.APPROVED,
    reviewedBy: "usr_meron",
    reviewedAt: "2026-10-04T09:20:00.000Z",
    reviewNote: "Repeat within the six-month validity window.",
    uploadedAt: "2026-10-04T08:31:00.000Z",
  },
  {
    id: "rx_5003",
    userId: "usr_chala",
    patientName: "Chala Kebede",
    prescriberName: "Dr. Hana Bekele",
    prescriberLicence: "EFDA-MD-2020-1177",
    facility: "St. Paul's Hospital",
    issuedAt: "2026-10-09T14:20:00.000Z",
    fileName: "salbutamol-inhaler.png",
    notes: "Asthma — reliever inhaler, two canisters. Review in three months.",
    medicineIds: ["med_012"],
    status: PRESCRIPTION_STATUS.PENDING,
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
    uploadedAt: "2026-10-10T07:12:00.000Z",
  },
  {
    id: "rx_5004",
    userId: "usr_chala",
    patientName: "Chala Kebede",
    prescriberName: "Dr. Hana Bekele",
    prescriberLicence: "EFDA-MD-2020-1177",
    facility: "St. Paul's Hospital",
    issuedAt: "2026-10-11T10:45:00.000Z",
    fileName: "coartem-scan.jpg",
    notes: "Suspected uncomplicated malaria following travel to Gambella.",
    medicineIds: ["med_005"],
    status: PRESCRIPTION_STATUS.PENDING,
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
    uploadedAt: "2026-10-11T11:03:00.000Z",
  },
  {
    id: "rx_5005",
    userId: "usr_sara",
    patientName: "Sara Tesfaye",
    prescriberName: "Dr. Yonas Girma",
    prescriberLicence: "EFDA-MD-2012-3390",
    facility: "Zewditu Memorial Hospital",
    issuedAt: "2026-09-02T13:00:00.000Z",
    fileName: "atorvastatin-trial.jpg",
    notes: "Trial of atorvastatin. Baseline lipids attached.",
    medicineIds: ["med_011"],
    status: PRESCRIPTION_STATUS.REJECTED,
    reviewedBy: "usr_meron",
    reviewedAt: "2026-09-02T15:10:00.000Z",
    reviewNote:
      "Scan is illegible — the prescriber signature and licence number cannot be read. Please re-upload a clearer copy.",
    uploadedAt: "2026-09-02T13:44:00.000Z",
  },
];

export function findPrescription(id) {
  return prescriptions.find((rx) => rx.id === id) ?? null;
}

export function prescriptionsForUser(userId) {
  return prescriptions
    .filter((rx) => rx.userId === userId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export function pendingPrescriptions() {
  return prescriptions
    .filter((rx) => rx.status === PRESCRIPTION_STATUS.PENDING)
    .sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
}
