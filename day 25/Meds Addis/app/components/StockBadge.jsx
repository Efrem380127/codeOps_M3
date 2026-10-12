import Icon from "./Icon";

/**
 * Stock badge.
 *
 * Takes a raw count rather than the medicine object on purpose: this component
 * is rendered inside Client Components too, and importing the catalogue module
 * would pull the whole product list into the browser bundle.
 *
 * Thresholds match lib/catalog.js — 10 units is the reorder point.
 */

const LOW_STOCK_THRESHOLD = 10;

export function stockLevel(stock) {
  const value = Number(stock) || 0;

  if (value === 0) return { key: "out", label: "Out of stock", badge: "badge--out" };
  if (value <= LOW_STOCK_THRESHOLD)
    return { key: "low", label: `Only ${value} left`, badge: "badge--low" };

  return { key: "ok", label: "In stock", badge: "badge--ok" };
}

export default function StockBadge({ stock }) {
  const level = stockLevel(stock);

  return <span className={`badge ${level.badge}`}>{level.label}</span>;
}

/**
 * "Prescription required" marker — the field that makes this a pharmacy.
 *
 * The ℞ glyph was replaced by a drawn capsule. U+211E is the correct
 * pharmaceutical symbol, but its rendering depends on whether the visitor's
 * system has a font that covers the Letterlike Symbols block, and when it falls
 * back it falls back badly. A drawn mark always looks the same.
 *
 * The word "Prescription" is still spelled out next to it, because colour and
 * symbol alone are never allowed to carry meaning in this system.
 */
export function PrescriptionBadge({ compact = false }) {
  return (
    <span className="badge badge--rx">
      <Icon name="capsule" />
      {compact ? "Rx" : "Prescription required"}
    </span>
  );
}
