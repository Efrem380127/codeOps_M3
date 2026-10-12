import { ImageResponse } from "next/og";

/**
 * The social card.
 *
 * Satori renders this outside the document, so there is no cascade and no CSS
 * custom properties: var(--ink-0) resolves to nothing, which is what an earlier
 * revision of this file asked for. Every colour below is the computed sRGB of
 * the matching token (see .impeccable.md). This is the one file in the app
 * where hex literals are the correct choice rather than a leftover.
 *
 * Light-theme palette: PAPER #f8fafc, INK #10141a, INK_2 #51565c,
 * RULE #d8dbdf, SIGNAL (paprika) #c63f29.
 */
export const alt = "Addis Eats — Ethiopian food, delivered across Addis Ababa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
            fontSize: 24,
            letterSpacing: 6,
            color: "#10141a"
          }}
        >
          ADDIS EATS
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 86,
            lineHeight: 1.04,
            letterSpacing: -2,
            color: "#10141a",
            maxWidth: 940
          }}
        >
          Dinner, from the kitchens that made the city.
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, background: "#d8dbdf" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 22,
              fontSize: 21,
              letterSpacing: 3,
              color: "#51565c"
            }}
          >
            <span>ADDIS ABABA</span>
            <span>addis-eats-six.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
