"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import Icon from "@/app/components/Icon";
import useNow from "@/app/lib/use-now";
import { etb, when, relative } from "@/lib/format";
import MapPlaceholder from "./MapPlaceholder";

const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => <MapPlaceholder />
});

/**
 * How each stream state presents itself.
 *
 * The connection used to be reported by a hand-built span per state — four
 * copies of the same inline-styled pill in four colours, built inside a render
 * function. That is the "every state is a rounded chip" reflex, and it meant
 * the disconnected state and the connected state could drift apart visually.
 * They are now one `.badge` with a tone, which is the same treatment a stock
 * level gets.
 */
const CONNECTION = {
  connecting: { tone: "badge badge--neutral", label: "Connecting" },
  connected: { tone: "badge badge--ok", label: "Live" },
  closed_delivered: { tone: "badge badge--info", label: "Stream closed" },
  error: { tone: "badge badge--out", label: "Disconnected" }
};

export default function LiveOrderStatus({ initialOrder }) {
  // The order is only ever read here — live updates arrive as separate state
  // (status, courier, delivery), so there is no setter to keep.
  const [order] = useState(initialOrder);
  const [status, setStatus] = useState(initialOrder?.status || "preparing");
  const [currentStep, setCurrentStep] = useState("Order accepted by kitchen");
  const [courier, setCourier] = useState(
    initialOrder?.courierLocation || {
      name: "Dawit Haile",
      vehicle: "Yamaha Motorbike (ET-3401)",
      phone: "0922334455",
      lat: 9.004,
      lng: 38.782,
      distanceKm: 1.4,
      etaMinutes: 8
    }
  );
  const [delivery, setDelivery] = useState(
    initialOrder?.deliveryLocation || {
      address: initialOrder?.area || "Bole Atlas, House 402",
      lat: 9.0125,
      lng: 38.775
    }
  );
  const [connectionState, setConnectionState] = useState("connecting");
  const [updatedAt, setUpdatedAt] = useState(initialOrder?.createdAt || null);

  // `null` until the client clock is available — see app/lib/use-now.js.
  const now = useNow();

  /**
   * Whether the stream has already told us the order was delivered.
   *
   * This is a ref rather than a read of `status` inside `onerror`, for two
   * reasons. A ref does not need to be in the effect's dependency list, and
   * putting `status` there — which the previous version did — tore the
   * EventSource down and reconnected it every time the status changed, so a
   * live order reconnected itself several times during a single delivery.
   */
  const deliveredRef = useRef(false);

  useEffect(() => {
    if (!initialOrder?.id) return;

    const eventSource = new EventSource(`/api/orders/${initialOrder.id}/stream`);

    eventSource.onopen = () => {
      setConnectionState("connected");
    };

    eventSource.addEventListener("init", (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.status) setStatus(payload.status);
        if (payload.courier) setCourier(payload.courier);
        if (payload.delivery) setDelivery(payload.delivery);
        if (payload.timestamp) setUpdatedAt(payload.timestamp);
      } catch {}
    });

    eventSource.addEventListener("status", (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.status) setStatus(payload.status);
        if (payload.step) setCurrentStep(payload.step);
        if (payload.courier) setCourier(payload.courier);
        if (payload.delivery) setDelivery(payload.delivery);
        if (payload.timestamp) setUpdatedAt(payload.timestamp);
      } catch {}
    });

    eventSource.addEventListener("delivered", (event) => {
      try {
        const payload = JSON.parse(event.data);
        deliveredRef.current = true;
        setStatus("delivered");
        if (payload.step) setCurrentStep(payload.step);
        setConnectionState("closed_delivered");
        eventSource.close();
      } catch {}
    });

    eventSource.onerror = () => {
      setConnectionState(deliveredRef.current ? "closed_delivered" : "error");
    };

    return () => {
      eventSource.close();
    };
  }, [initialOrder?.id]);

  const connection = CONNECTION[connectionState] ?? CONNECTION.connecting;

  return (
    <>
      <div className="section-head">
        <div>
          <span className="section-index">Order tracking</span>
          <h1>Order {order.id}</h1>
          <p className="small muted mt-2 mb-0">
            {order.name} &middot; {order.area}
          </p>
        </div>

        <p className="mb-0">
          <span className={connection.tone}>
            {connectionState === "connected" && (
              <span className="pulse-dot" aria-hidden="true" />
            )}
            {connection.label}
          </span>
        </p>
      </div>

      {/*
        Four figures on a hairline grid, not four rounded tiles with a shadow.
        The stage is a value like any other, so it sits in the same row rather
        than in a coloured pill of its own.
      */}
      <div className="stats">
        <div className="stat">
          <span className="stat__label">Current stage</span>
          <p className="stat__value" style={{ textTransform: "capitalize" }}>
            {status.replace(/_/g, " ")}
          </p>
        </div>

        <div className="stat">
          <span className="stat__label">Total billed</span>
          <p className="stat__value num">{etb(order.total)}</p>
        </div>

        <div className="stat">
          <span className="stat__label">Placed</span>
          <p className="stat__value" style={{ fontSize: "var(--t-base)" }}>
            {when(order.createdAt)}
          </p>
        </div>

        <div className="stat">
          <span className="stat__label">Last update</span>
          <p className="stat__value" style={{ fontSize: "var(--t-base)" }}>
            {/* Placeholder until the client clock is known, so the server and
                the hydration pass agree on the same string. */}
            {now === null ? "Pending" : relative(updatedAt, now)}
          </p>
        </div>
      </div>

      <div className="rule-block">
        <span className="section-index">Activity</span>
        <p className="mb-0">{currentStep}</p>
      </div>

      <div className="mt-6">
        <DeliveryMap
          courier={courier}
          delivery={delivery}
          status={status}
          updatedAt={updatedAt}
        />
      </div>

      {connectionState === "error" && (
        <p className="small muted mt-4 mb-0">
          <Icon name="alert" style={{ color: "var(--danger-ink)" }} /> The live
          stream is unavailable, so the map is no longer updating. Reloading the
          page reconnects it.
        </p>
      )}
    </>
  );
}
