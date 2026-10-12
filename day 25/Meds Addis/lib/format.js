/**
 * Meds Addis — formatting.
 *
 * Every locale-aware value in the app goes through here. Two rules this file
 * exists to enforce:
 *
 *  1. Prices are Ethiopian Birr, formatted with the `en-ET` locale so the
 *     symbol and grouping are correct.
 *  2. Times are shown in `Africa/Addis_Ababa` (UTC+3) regardless of where the
 *     server or the viewer happens to be. Without an explicit timeZone, a build
 *     in a UTC container renders a delivery slot three hours out.
 *
 * These are module-level instances on purpose: constructing an Intl formatter is
 * expensive, and this module is imported by both server and client components.
 */

export const ETB = "ETB";
export const CURRENCY = "ETB";
export const LOCALE = "en-ET";
export const TIME_ZONE = "Africa/Addis_Ababa";

/** "ETB 285" — no decimals; birr is not quoted in cents in retail practice. */
export const etb = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Same, but always showing santim — used on the order total line. */
export const etbExact = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const number = new Intl.NumberFormat(LOCALE);

/** "12 Oct 2026, 14:32" in Addis time. */
export const when = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

/** "12 Oct 2026" in Addis time. */
export const dateOnly = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeZone: TIME_ZONE,
});

/** "14:32" in Addis time. */
export const timeOnly = new Intl.DateTimeFormat(LOCALE, {
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

export const relative = new Intl.RelativeTimeFormat(LOCALE, {
  numeric: "auto",
});

/** Convenience wrapper so callers never pass a raw number to the UI. */
export function price(value) {
  return etb.format(Number(value) || 0);
}

export function priceExact(value) {
  return etbExact.format(Number(value) || 0);
}

/**
 * "3 hours ago" / "in 20 minutes" — used for order and prescription activity.
 * Falls back to an absolute date beyond a week, which reads better than
 * "43 days ago".
 */
export function timeAgo(input, now = Date.now()) {
  const then = new Date(input).getTime();
  if (Number.isNaN(then)) return "";

  const diffMs = then - now;
  const diffMin = Math.round(diffMs / 60000);

  if (Math.abs(diffMin) < 1) return "just now";
  if (Math.abs(diffMin) < 60) return relative.format(diffMin, "minute");

  const diffHours = Math.round(diffMin / 60);
  if (Math.abs(diffHours) < 24) return relative.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) <= 7) return relative.format(diffDays, "day");

  return dateOnly.format(new Date(then));
}

/** Formats a stored 09XXXXXXXX number for display: "0911 223 344". */
export function phone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 10) return String(value ?? "");
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

/** Percentages for the dashboard, always one decimal place. */
export function percent(value) {
  return `${(Number(value) || 0).toFixed(1)}%`;
}
