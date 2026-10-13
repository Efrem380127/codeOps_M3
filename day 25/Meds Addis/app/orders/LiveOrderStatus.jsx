"use client";

import useSWR from "swr";
import { useEffect, useRef, useState } from "react";

import fetcher from "@/lib/fetcher";
import useNow from "@/lib/use-now";
import { price, timeAgo, when } from "@/lib/format";

/**
 * Live order status.
 *
 * Two transports, used for two different jobs — and the reason both are here
 * rather than one:
 *
 *   SWR (refreshInterval: 5000)  polls /api/orders/:id. It is the durable
 *     source of truth: status changes, cancellations, totals. Polling survives
 *     a dropped connection with no code at all, which is why it is the fallback
 *     and not the other way round.
 *
 *   SSE (/stream)  pushes courier coordinates only while the order is actually
 *     out for delivery. A one-way stream is exactly what Server-Sent Events are
 *     for, and the browser reconnects on its own.
 *
 * `fallbackData: initialOrder` means the first paint uses the server-rendered
 * order — so the component never shows a spinner for data the page already has.
 *
 * The cleanup is the part that is easy to get wrong: an EventSource that is
 * never closed keeps the connection open after navigation, and the browser will
 * hold it until the tab closes. Both the subscription and its listener are torn
 * down together.
 */
export default function LiveOrderStatus({ orderId, initialOrder }) {
  const { data, error, isLoading } = useSWR(
    `/api/orders/${orderId}`,
    fetcher,
    {
      fallbackData: initialOrder,
      // Poll fast enough to feel live, slow enough not to hammer the endpoint.
      refreshInterval: 5000,
      revalidateOnFocus: true,
    },
  );

  /**
   * One object, keyed to the stream it describes.
   *
   * The previous version held three separate pieces of state and reset two of
   * them from inside the effect — `setStreamState("idle")` and `setLive(null)`
   * when the order was not in transit, and `setStreamState("connecting")` when
   * it was. Those are synchronous `setState` calls in an effect body, which the
   * `react-hooks/set-state-in-effect` rule flags, and they each cost an extra
   * render before the effect's real work began.
   *
   * Storing the key alongside the state makes both values derived. When the
   * order is not in transit the key is `null`, so nothing the previous stream
   * reported can be shown; and if the visitor switches to a different order,
   * the old key no longer matches and its courier is ignored rather than being
   * cleared by hand.
   */
  const [stream, setStream] = useState({
    key: null,
    state: "connecting",
    courier: null,
  });
  const sourceRef = useRef(null);

  // `null` until the client clock is available — see lib/use-now.js. Passing it
  // to timeAgo() is what stops the relative times from disagreeing between the
  // server render and hydration.
  const now = useNow();

  const order = data ?? initialOrder;
  const isInTransit = order?.status === "out_for_delivery";

  const streamKey = isInTransit ? orderId : null;
  const streamState = stream.key === streamKey ? stream.state : "connecting";
  const liveCourier = stream.key === streamKey ? stream.courier : null;

  // `idle` is derived, not stored: it is simply what "not in transit" means.
  const view = isInTransit ? streamState : "idle";

  useEffect(() => {
    // Only open a stream when there is a courier to follow. A stream on a
    // delivered order would sit open for 45 ticks doing nothing.
    if (!isInTransit) return undefined;

    const source = new EventSource(`/api/orders/${orderId}/stream`);
    sourceRef.current = source;

    function handleSnapshot(event) {
      try {
        const payload = JSON.parse(event.data);
        setStream({
          key: orderId,
          state: "open",
          courier: payload.courier ?? null,
        });
      } catch {
        // A malformed frame is not worth tearing the stream down over; the
        // next tick will arrive in four seconds.
      }
    }

    function handleDone() {
      setStream((current) => ({ ...current, key: orderId, state: "closed" }));
      source.close();
    }

    source.addEventListener("snapshot", handleSnapshot);
    source.addEventListener("done", handleDone);

    source.onerror = () => {
      // EventSource retries on its own. Report it, do not fight it.
      setStream((current) => ({
        ...current,
        key: orderId,
        state: "reconnecting",
      }));
    };

    return () => {
      source.removeEventListener("snapshot", handleSnapshot);
      source.removeEventListener("done", handleDone);
      source.close();
      sourceRef.current = null;
    };
  }, [isInTransit, orderId]);

  if (error) {
    return (
      <div className="alert alert--error" role="alert">
        <div>
          <p className="alert__title">Live status unavailable</p>
          <p className="mb-0">
            We could not refresh this order. The details below are the last
            version we received.
          </p>
        </div>
      </div>
    );
  }

  // Falls back to the polled order when no stream is running.
  const courier = liveCourier ?? order?.courier ?? null;

  return (
    <div className="card">
      <div className="between">
        <h2 className="card__title mb-0">Live status</h2>
        <span className={`status ${order.statusTone}`}>{order.statusLabel}</span>
      </div>

      <ul className="spec-list mt-4">
        <li>
          <span className="spec-list__k">Items</span>
          <span>{order.itemCount}</span>
        </li>
        <li>
          <span className="spec-list__k">Total</span>
          <span>{price(order.total)}</span>
        </li>
        <li>
          <span className="spec-list__k">Placed</span>
          <span>
            {order.placedAt ? (
              <span title={when.format(new Date(order.placedAt))}>
                {/* This read `timeAgo(new Date())` — the current time compared
                    against itself, so it said "just now" on every order, for
                    ever. The label was also "Last updated", which is not a
                    field this API has; `placedAt` is the timestamp it does
                    carry, so the label now says what the value is. */}
                {now === null ? "—" : timeAgo(order.placedAt, now)}
              </span>
            ) : (
              "—"
            )}
          </span>
        </li>
      </ul>

      {/*
        The transport is announced, not hidden. A reviewer (and a screen
        reader) should be able to tell whether the number in front of them is
        coming from a stream or from the poll — they behave differently when
        the network does.
      */}
      <p className="small muted mt-4 mb-0" aria-live="polite">
        {isLoading && !data && "Refreshing…"}
        {!isLoading && isInTransit && view === "open" &&
          "Live courier stream connected — position updates every few seconds."}
        {!isLoading && isInTransit && view === "connecting" &&
          "Connecting to the live courier stream…"}
        {!isLoading && isInTransit && view === "reconnecting" &&
          "Live stream dropped — reconnecting. Status is still polling every 5 seconds."}
        {!isLoading && isInTransit && view === "closed" &&
          "Live stream finished. Status continues to poll every 5 seconds."}
        {!isLoading && !isInTransit &&
          "Status refreshes every 5 seconds."}
      </p>

      {courier && (
        <div className="mt-4">
          <h3 className="mb-0" style={{ fontSize: "var(--t-base)" }}>
            Your courier
          </h3>

          <ul className="spec-list mt-2">
            <li>
              <span className="spec-list__k">Name</span>
              <span>{courier.name}</span>
            </li>
            <li>
              <span className="spec-list__k">Vehicle</span>
              <span>{courier.vehicle}</span>
            </li>
            <li>
              <span className="spec-list__k">Phone</span>
              <span>{courier.phone}</span>
            </li>
            <li>
              <span className="spec-list__k">Position</span>
              <span>
                {courier.lat.toFixed(4)}, {courier.lng.toFixed(4)}
              </span>
            </li>
            <li>
              <span className="spec-list__k">Reported</span>
              <span>
                {now === null ? "—" : timeAgo(courier.updatedAt, now)}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
