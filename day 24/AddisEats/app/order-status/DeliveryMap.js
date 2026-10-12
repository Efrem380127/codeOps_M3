"use client";

import { when, relative } from "@/lib/format";

export default function DeliveryMap({
  courier = {
    name: "Dawit Haile",
    vehicle: "Yamaha Motorbike (ET-3401)",
    phone: "0922334455",
    lat: 9.0040,
    lng: 38.7820,
    distanceKm: 1.4,
    etaMinutes: 8
  },
  delivery = {
    address: "Bole Atlas, House 402",
    lat: 9.0125,
    lng: 38.7750
  },
  status = "out_for_delivery",
  updatedAt = new Date().toISOString()
}) {
  const cLat = courier?.lat || 9.0040;
  const cLng = courier?.lng || 38.7820;
  const dLat = delivery?.lat || 9.0125;
  const dLng = delivery?.lng || 38.7750;

  const minLat = Math.min(cLat, dLat) - 0.005;
  const maxLat = Math.max(cLat, dLat) + 0.005;
  const minLng = Math.min(cLng, dLng) - 0.007;
  const maxLng = Math.max(cLng, dLng) + 0.007;

  const svgWidth = 700;
  const svgHeight = 360;

  function toX(lng) {
    return ((lng - minLng) / (maxLng - minLng)) * (svgWidth - 100) + 50;
  }

  function toY(lat) {
    return svgHeight - (((lat - minLat) / (maxLat - minLat)) * (svgHeight - 100) + 50);
  }

  const courierX = toX(cLng);
  const courierY = toY(cLat);
  const deliveryX = toX(dLng);
  const deliveryY = toY(dLat);

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r)",
        padding: "1.25rem",
        marginBottom: "1.5rem"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "var(--ink-0)", margin: 0 }}>
          Live Courier & Delivery Map
        </h3>
        <span style={{ fontSize: "0.8125rem", color: "var(--ink-2)" }}>
          Fit to courier & destination
        </span>
      </div>

      <div
        style={{
          height: "360px",
          width: "100%",
          position: "relative",
          backgroundColor: "var(--surface-sunken)",
          borderRadius: "var(--r)",
          overflow: "hidden",
          border: "1px solid var(--rule)"
        }}
        role="img"
        aria-label={`Interactive map showing courier at ${cLat.toFixed(4)} North, ${cLng.toFixed(4)} East delivering to ${delivery.address} at ${dLat.toFixed(4)} North, ${dLng.toFixed(4)} East`}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              {/* The grid used to be stroked in --surface-sunken, the same colour
                  as the canvas underneath it, so it was invisible. */}
              <path className="map-road" d="M 40 0 L 0 0 0 40" strokeWidth="0.8" />
            </pattern>
          </defs>

          <rect width={svgWidth} height={svgHeight} className="map-canvas" />
          <rect width={svgWidth} height={svgHeight} fill="url(#cityGrid)" />

          <path
            className="map-road"
            d={`M 0,${svgHeight * 0.4} Q ${svgWidth * 0.4},${svgHeight * 0.35} ${svgWidth},${svgHeight * 0.6}`}
            strokeWidth="12"
          />
          <path
            className="map-road"
            d={`M ${svgWidth * 0.3},0 Q ${svgWidth * 0.4},${svgHeight * 0.5} ${svgWidth * 0.25},${svgHeight}`}
            strokeWidth="10"
          />
          <path
            className="map-road"
            d={`M ${svgWidth * 0.7},0 L ${svgWidth * 0.6},${svgHeight}`}
            strokeWidth="8"
          />

          <line
            x1={courierX}
            y1={courierY}
            x2={deliveryX}
            y2={deliveryY}
            className="map-route"
          />

          <g transform={`translate(${deliveryX}, ${deliveryY})`}>
            <circle r="18" className="map-halo-destination" opacity="0.6" />
            <circle r="10" className="map-pin is-destination" />
            <rect x="-60" y="-38" width="120" height="24" className="map-tag" opacity="0.9" />
            <text x="0" y="-22" textAnchor="middle" className="map-tag-text">
              Destination
            </text>
          </g>

          <g transform={`translate(${courierX}, ${courierY})`}>
            <circle r="22" className="map-halo-courier" />
            <circle r="11" className="map-pin is-courier" />
            <rect x="-60" y="-38" width="120" height="24" className="map-tag is-courier" opacity="0.95" />
            <text x="0" y="-22" textAnchor="middle" className="map-tag-text">
              Courier ({courier?.name || "Driver"})
            </text>
          </g>
        </svg>
      </div>

      <div
        aria-live="polite"
        style={{
          marginTop: "0.875rem",
          padding: "0.875rem 1rem",
          backgroundColor: "var(--surface-sunken)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--r)",
          fontSize: "0.875rem",
          color: "var(--ink-0)",
          lineHeight: "1.6"
        }}
      >
        <p style={{ margin: "0 0 0.375rem 0", fontWeight: "600", color: "var(--ink-0)" }}>
          Live Delivery Locations (Text Alternative):
        </p>
        <p style={{ margin: "0 0 0.25rem 0" }}>
          <strong>Courier:</strong> {courier?.name || "Courier"} ({courier?.vehicle || "Vehicle"}) is located at{" "}
          <code>{cLat.toFixed(4)}° N, {cLng.toFixed(4)}° E</code>.
          {courier?.distanceKm !== undefined && (
            <span> Distance remaining: <strong>{courier.distanceKm} km</strong> (ETA: ~{courier.etaMinutes || 5} min).</span>
          )}
        </p>
        <p style={{ margin: "0 0 0.25rem 0" }}>
          <strong>Destination:</strong> {delivery?.address} at{" "}
          <code>{dLat.toFixed(4)}° N, {dLng.toFixed(4)}° E</code>.
        </p>
        <p style={{ margin: 0, color: "var(--ink-2)", fontSize: "0.8125rem" }}>
          <strong>Status:</strong> <span style={{ textTransform: "capitalize", fontWeight: "600", color: status === "delivered" ? "var(--ok)" : "var(--signal)" }}>{status.replace(/_/g, " ")}</span>
          {" · "}Last tracked: {when(updatedAt)} ({relative(updatedAt)}).
        </p>
      </div>
    </div>
  );
}
