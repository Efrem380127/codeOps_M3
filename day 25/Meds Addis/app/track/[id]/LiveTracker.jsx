"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { timeAgo } from "@/lib/format";

/**
 * Live courier tracker.
 *
 * Three things are being demonstrated together here, and each one is a reading-
 * sheet item:
 *
 *  1. `next/dynamic` with `ssr: false`. Leaflet cannot run on the server, so the
 *     map is code-split out of the server bundle and loaded in the browser only.
 *     The map library is therefore not part of the first-load JavaScript for
 *     this route at all.
 *
 *  2. Server-Sent Events. A one-way stream is exactly the shape of this problem
 *     — courier to browser — and EventSource reconnects on its own, which a
 *     hand-rolled polling loop would not.
 *
 *  3. Effect cleanup. The EventSource is closed in the cleanup function, and its
 *     listeners are removed with it. An EventSource left open after navigation
 *     keeps the connection alive until the tab closes; this is the single most
 *     common leak in a live-tracking UI.
 */
const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-busy="true"
      style={{
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: "var(--surface-sunken)",
        color: "var(--ink-3)",
        fontSize: "var(--t-sm)",
      }}
    >
      <span>
        <span className="spinner" aria-hidden="true" /> Loading the map…
      </span>
    </div>
  ),
});

export default function LiveTracker({ orderId, courier: initialCourier, delivery, status }) {
  const [courier, setCourier] = useState(initialCourier ?? null);
  // "connecting" is the right starting point for the only case where the stream
  // matters. Nothing sets this synchronously from inside the effect: the effect
  // subscribes, and the stream's own events move the state on.
  const [streamState, setStreamState] = useState("connecting");
  const [tick, setTick] = useState(0);

  const isInTransit = status === "out_for_delivery";

  // Derived rather than stored. An order that is not out for delivery has no
  // stream to describe, whatever the last stream event left behind — so this
  // needs no reset, and the effect has no state to write on entry.
  const view = isInTransit ? streamState : "idle";

  useEffect(() => {
    if (!isInTransit) return undefined;

    const source = new EventSource(`/api/orders/${orderId}/stream`);

    function handleSnapshot(event) {
      try {
        const payload = JSON.parse(event.data);
        setStreamState("open");
        if (payload.courier) {
          setCourier(payload.courier);
          setTick((value) => value + 1);
        }
      } catch {
        // Ignore a malformed frame; the next tick is four seconds away.
      }
    }

    function handleDone() {
      setStreamState("closed");
      source.close();
    }

    source.addEventListener("snapshot", handleSnapshot);
    source.addEventListener("done", handleDone);
    source.onerror = () => setStreamState("reconnecting");

    return () => {
      source.removeEventListener("snapshot", handleSnapshot);
      source.removeEventListener("done", handleDone);
      source.close();
    };
  }, [isInTransit, orderId]);

  return (
    <>
      <div className="map-frame" style={{ height: "420px" }}>
        <DeliveryMap courier={courier} delivery={delivery} status={status} />
      </div>

      <p className="small muted mt-2" aria-live="polite">
        {view === "idle" &&
          "This order is not out for delivery yet, so the courier is not on the map. This page updates as soon as it is dispatched."}
        {view === "connecting" && "Connecting to the courier stream…"}
        {view === "open" &&
          `Live — position updated ${timeAgo(new Date())} (update ${tick}).`}
        {view === "reconnecting" &&
          "Stream dropped — the browser is reconnecting automatically."}
        {view === "closed" &&
          "The live window has ended. Refresh to resume tracking."}
      </p>
    </>
  );
}
