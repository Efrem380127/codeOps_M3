/**
 * Meds Addis — customer reviews of dispensed medicines.
 *
 * Kept deliberately separate from `medicines`: this is the one-to-many side of
 * the detail page, fetched in parallel with the medicine itself so the page can
 * stream rather than wait on both.
 */

export const reviews = [
  {
    id: "rev_01",
    medicineId: "med_003",
    author: "Hanna G.",
    rating: 5,
    comment:
      "Ordered at 9pm and it arrived before 10. The blister packs were sealed and the batch number was printed on the invoice.",
    date: "2026-10-02",
  },
  {
    id: "rev_02",
    medicineId: "med_003",
    author: "Yonas A.",
    rating: 4,
    comment: "Good price, genuine product. Delivery took a little longer than the estimate.",
    date: "2026-09-24",
  },
  {
    id: "rev_03",
    medicineId: "med_001",
    author: "Selam T.",
    rating: 5,
    comment:
      "The pharmacist called to confirm the dose before dispensing. That is the first time an online pharmacy has done that for me.",
    date: "2026-09-29",
  },
  {
    id: "rev_04",
    medicineId: "med_008",
    author: "Getachew M.",
    rating: 5,
    comment:
      "Monthly repeat arrives on the same date every month. Cold-chain packaging was intact.",
    date: "2026-10-05",
  },
  {
    id: "rev_05",
    medicineId: "med_012",
    author: "Bethlehem K.",
    rating: 4,
    comment:
      "Reliever inhaler was in stock when two other pharmacies were out. Spacer not included — worth adding.",
    date: "2026-09-18",
  },
  {
    id: "rev_06",
    medicineId: "med_014",
    author: "Tesfaye B.",
    rating: 5,
    comment: "Bought ten sachets for the household. Clear instructions printed on each one.",
    date: "2026-09-11",
  },
  {
    id: "rev_07",
    medicineId: "med_013",
    author: "Marta D.",
    rating: 4,
    comment: "Effective, and the dosage guidance on the page matched what my doctor said.",
    date: "2026-10-07",
  },
  {
    id: "rev_08",
    medicineId: "med_007",
    author: "Kalkidan W.",
    rating: 5,
    comment: "Cheaper than the pharmacy near my office and delivered the same afternoon.",
    date: "2026-09-30",
  },
];

export function reviewsForMedicine(medicineId) {
  return reviews
    .filter((review) => review.medicineId === medicineId)
    .sort((a, b) => b.date.localeCompare(a.date));
}
