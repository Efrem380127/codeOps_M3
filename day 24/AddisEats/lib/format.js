export function etb(amount) {
  const num = Number(amount) || 0;
  return `${num.toLocaleString("en-US")} ETB`;
}

/**
 * Absolute date and time, pinned to Addis Ababa time.
 *
 * The `timeZone` is not decoration. Without it, `toLocaleDateString` uses the
 * *runtime's* zone — UTC on the server, the visitor's zone in the browser. This
 * function renders the hour, so a server in UTC and a visitor in EAT (UTC+3)
 * produced two different strings for the same timestamp, and React reported a
 * hydration mismatch (#418) on every page that showed an order time.
 *
 * Pinning the zone fixes that and is also the correct thing to display: this is
 * a delivery service in Addis Ababa, so "when was this ordered" means when it
 * was ordered there, regardless of where the reader happens to be sitting.
 */
export function when(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    timeZone: "Africa/Addis_Ababa",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

/**
 * "4 minutes ago", relative to `now`.
 *
 * `now` is a parameter rather than a call to `Date.now()` inside the function,
 * because a relative time cannot be rendered during server rendering at all:
 * the server's clock and the browser's clock are different instants, so the
 * same expression yields two different strings and React reports a hydration
 * mismatch. Callers pass a clock value they obtained on the client, and omit it
 * on the server (see the `useNow` hook in the order status view).
 */
export function relative(timestamp, now = Date.now()) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "—";
  const diffMs = now - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHours = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSec) < 30) return "just now";
  if (diffSec > 0) {
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } else {
    const absMin = Math.abs(diffMin);
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);
    if (absMin < 60) return `in ${absMin} minute${absMin === 1 ? "" : "s"}`;
    if (absHours < 24) return `in ${absHours} hour${absHours === 1 ? "" : "s"}`;
    return `in ${absDays} day${absDays === 1 ? "" : "s"}`;
  }
}
