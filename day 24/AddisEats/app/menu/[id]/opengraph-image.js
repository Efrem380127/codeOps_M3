import { ImageResponse } from "next/og";
import { dishes } from "@/app/data/dishes";

/**
 * The per-dish social card.
 *
 * Satori renders this outside the document, so there is no cascade and no CSS
 * custom properties — var(--ink-0) resolves to nothing. An earlier revision
 * asked for exactly that, and also still carried #f59e0b and #fef3c7 from the
 * palette this app used before the rebrand. Every colour below is the computed
 * sRGB of the matching token (see .impeccable.md), which is why this file
 * contains hex literals.
 *
 * Light-theme palette: PAPER #f8fafc, INK #10141a, INK_2 #51565c,
 * INK_3 #6a6f75, RULE #d8dbdf, SIGNAL (paprika) #c63f29.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { id } = await params;
  const dish = dishes.find((d) => String(d.id) === String(id)) || {
    name: "Ethiopian Dish",
    price: 200,
    summary: "Authentic Ethiopian culinary specialty"
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f8fafc",
          padding: "76px 80px",
          position: "relative"
        }}
      >
        {/* The same signal rule that tops the site header. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#c63f29"
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 6,
            color: "#10141a"
          }}
        >
          <span>ADDIS EATS</span>
          <span style={{ color: "#6a6f75" }}>MENU</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#10141a",
              maxWidth: 940
            }}
          >
            {dish.name}
          </div>
          {/* The price is the one thing on the card that takes the signal. */}
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 40,
              letterSpacing: 1,
              color: "#c63f29"
            }}
          >
            {dish.price} ETB
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, background: "#d8dbdf" }} />
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 22,
              lineHeight: 1.4,
              color: "#51565c",
              maxWidth: 960
            }}
          >
            {dish.summary}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
