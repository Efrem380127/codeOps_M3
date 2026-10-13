/**
 * Which glyph stands for which therapeutic category.
 *
 * Kept in one place because two surfaces draw it — the home page's category
 * tiles and, later, any filter UI that wants the same visual language. A map
 * duplicated across two files is a map that drifts.
 *
 * The keys are the nine real categories in app/data/medicines.js. If a
 * category is ever added without an entry here, `iconForCategory` falls back to
 * the generic capsule rather than rendering nothing.
 */

const CATEGORY_ICONS = {
  Antibiotics: "capsule",
  "Pain & Fever": "alert",
  Antimalarials: "shield",
  "Vitamins & Supplements": "star",
  "Diabetes Care": "monitor",
  Cardiovascular: "heart",
  Respiratory: "lungs",
  Gastrointestinal: "stomach",
  Dermatology: "bottle",
};

export function iconForCategory(category) {
  return CATEGORY_ICONS[category] ?? "capsule";
}
