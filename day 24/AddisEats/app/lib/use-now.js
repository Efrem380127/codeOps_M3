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
 * A relative time ("4 minutes ago") cannot be rendered on the server: the
 * server's clock and the browser's clock are different instants, so the same
 * expression produces two different strings and React reports a hydration
 * mismatch. Returning `null` on the server and for the hydration pass means the
 * first client render matches the server exactly; the real value arrives on the
 * render after hydration.
 *
 * Callers should render a stable placeholder while this is `null`.
 */
export default function useNow() {
  const bucket = useSyncExternalStore(subscribe, readBucket, readServerBucket);
  return bucket === null ? null : bucket * TICK_MS;
}
