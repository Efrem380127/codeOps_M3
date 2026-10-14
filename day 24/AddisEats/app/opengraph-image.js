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
 * Light-theme palette: PAPER #fcf9eb, INK #102116, INK_2 #4c5d51,
 * RULE #d4dfcb, SIGNAL (forest green) #194e33, ACCENT (lime) #bcde57.
 */
export const alt = "Addis Eats, Ethiopian food delivered across Addis Ababa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* The domain printed on the card. Read from the deployment's own URL rather
   than typed in: the previous revision hardcoded a domain that now belongs to
   a different project, so every share card advertised the wrong site. */
const SITE = (
  process.env.NEXT_PUBLIC_APP_URL || "https://addis-eats-capstone.vercel.app"
).replace(/^https?:\/\//, "");

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
          background: "#fcf9eb",
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
            background: "#194e33"
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 6,
            color: "#102116"
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
            color: "#102116",
            maxWidth: 940
          }}
        >
          Dinner, cooked when you order it.
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, background: "#d4dfcb" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 22,
              fontSize: 21,
              letterSpacing: 3,
              color: "#4c5d51"
            }}
          >
            <span>ADDIS ABABA</span>
            <span>{SITE}</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
