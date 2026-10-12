"use client";

import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

/**
 * Delivery map.
 *
 * Loaded through next/dynamic with `ssr: false` — see LiveTracker.jsx — because
 * Leaflet touches `window` the moment it is imported. Rendering it on the server
 * throws; importing it eagerly into a server-rendered tree throws at build time.
 *
 * CircleMarker rather than Marker on purpose. Leaflet's default pin is a PNG
 * resolved from a relative path that bundlers rewrite, which is the classic
 * "markers are broken images" bug. A circle is drawn from the vector layer and
 * has no asset to lose. It also reads better at this zoom, where three pins
 * overlap.
 *
 * OpenStreetMap tiles are used directly rather than a paid provider because the
 * attribution requirement is satisfied and there is no key to leak. A production
 * pharmacy would move to a keyed provider — see FUTURE.md.
 */
const STORE = { lat: 9.0105, lng: 38.7613, label: "Meds Addis — Bole branch" };

export default function DeliveryMap({ courier, delivery, status }) {
  const courierPosition = courier
    ? [courier.lat, courier.lng]
    : null;

  const destination = delivery
    ? [delivery.lat, delivery.lng]
    : [9.0125, 38.775];

  const centre = courierPosition ?? destination;

  return (
    <MapContainer
      center={centre}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        maxZoom={19}
      />

      {/* The pharmacy. Colours come from .map-marker--* in globals.css rather
          than being passed inline, so the palette lives in one place. */}
      <CircleMarker
        center={[STORE.lat, STORE.lng]}
        radius={9}
        pathOptions={{ className: "map-marker map-marker--store", fillOpacity: 1 }}
      >
        <Popup>{STORE.label}</Popup>
      </CircleMarker>

      {/* The delivery address. */}
      <CircleMarker
        center={destination}
        radius={9}
        pathOptions={{
          className: "map-marker map-marker--destination",
          fillOpacity: 1
        }}
      >
        <Popup>
          Delivery address
          {delivery?.address ? ` — ${delivery.address}` : ""}
        </Popup>
      </CircleMarker>

      {/* The courier, only once one has been dispatched. */}
      {courierPosition && (
        <>
          <CircleMarker
            center={courierPosition}
            radius={11}
            pathOptions={{
              className: "map-marker map-marker--courier",
              fillOpacity: 1
            }}
          >
            <Popup>
              <strong>{courier.name}</strong>
              <br />
              {courier.vehicle}
              <br />
              {courier.phone}
            </Popup>
          </CircleMarker>

          <Polyline
            positions={[courierPosition, destination]}
            pathOptions={{ className: "map-route", weight: 2, opacity: 0.6 }}
          />
        </>
      )}
    </MapContainer>
  );
}
