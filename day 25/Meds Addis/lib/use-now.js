"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 30_000;

function subscribe(onChange) {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
}

/**
 * The snapshot is bucketed to the tick interval rather than being `Date.now()`.
 *
 * `useSyncExternalStore` re-renders whenever `getSnapshot` returns a value
 * different from the last one. A raw `Date.now()` returns a new number on every
 * call, so React would detect a change on each render and loop forever. A
 * bucket that only advances once per tick is stable between ticks.
 */
function readBucket() {
  return Math.floor(Date.now() / TICK_MS);
}

function readServerBucket() {
  return null;
}

/**
 * The current time, or `null` during server rendering and hydration.
 *
 * `timeAgo()` defaults its `now` to `Date.now()`, which means the server and
 * the browser evaluate it at different instants. Most of the time they land in
 * the same minute and agree; when a minute boundary falls between the server
 * render and hydration, they do not, and React reports a hydration mismatch.
 * A fault that appears on roughly one page load in sixty is worse than a
 * consistent one, because it never reproduces on demand.
 *
 * Returning `null` for the server snapshot and the hydration pass makes the
 * first client render match the server exactly; the real value arrives on the
 * render after hydration. Callers render a stable placeholder while it is null.
 */
export default function useNow() {
  const bucket = useSyncExternalStore(subscribe, readBucket, readServerBucket);
  return bucket === null ? null : bucket * TICK_MS;
}
