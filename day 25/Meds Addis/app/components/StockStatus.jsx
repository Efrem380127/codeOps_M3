/**
 * Stock state, as text.
 *
 * Takes a raw count rather than the medicine object on purpose: this component
 * is rendered inside Client Components too, and importing the catalogue module
 * would pull the whole product list into the browser bundle.
 *
 * Thresholds match lib/catalog.js — 10 units is the reorder point.
 *
 * This used to render a filled capsule with a tinted wash behind the word. The
 * wash is gone. A pill badge is the most recognisable marker of a generated
 * interface, and on a catalogue card it was one of four; the word alone carries
 * the state and the colour reinforces it.
 */

const LOW_STOCK_THRESHOLD = 10;

export function stockTone(stock) {
  const value = Number(stock) || 0;

  if (value === 0) return { key: "out", label: "Out of stock", tone: "status--out" };
  if (value <= LOW_STOCK_THRESHOLD)
    return { key: "low", label: `Only ${value} left`, tone: "status--low" };

  return { key: "ok", label: "In stock", tone: "status--ok" };
}

export default function StockStatus({ stock }) {
  const level = stockTone(stock);

  return <span className={`status ${level.tone}`}>{level.label}</span>;
}

/**
 * "Prescription required" — the field that makes this a pharmacy.
 *
 * The ℞ glyph was replaced by a drawn capsule when this was a badge; the badge
 * is gone, so it is now plain text with no icon. The words are unambiguous on
 * their own, and the detail page carries the full amber alert for the cases
 * where the consequence needs spelling out.
 *
 * The word "Prescription" is still spelled out rather than reduced to "Rx" on
 * the detail page, because colour and symbol alone are never allowed to carry
 * meaning in this system. The compact form is for the catalogue grid only.
 */
export function PrescriptionMarker({ compact = false }) {
  return (
    <span className="status status--rx">
      {compact ? "Rx" : "Prescription required"}
    </span>
  );
}
