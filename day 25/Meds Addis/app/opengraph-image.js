import { ImageResponse } from "next/og";

/**
 * OpenGraph card, generated at the edge by next/og.
 *
 * This file is why metadataBase matters. A file-based `opengraph-image` produces
 * a URL; without `metadataBase` in the root layout that URL is relative, and
 * every link preview — WhatsApp, Telegram, LinkedIn — silently renders with no
 * picture. The base is what makes it absolute.
 *
 * `alt` is required rather than optional: an OG image is content, and a social
 * card without alternative text is invisible to anyone using a screen reader.
 *
 * Served as a static export at build time because there are no dynamic
 * parameters — Next prerenders it once and the CDN holds it.
 *
 * Design: this is the same Clinical Swiss system as the site, rebuilt for a
 * standalone canvas. That means it cannot use the CSS custom properties — Satori
 * renders outside the document — so the palette is written out as literals. They
 * are the exact sRGB equivalents of the oklch tokens in globals.css, converted
 * rather than eyeballed, so the card and the site are the same colour.
 *
 * The gradient panel that used to be here is gone. It is now paper, an amber
 * regulatory band, an ink wordmark and a data strip.
 */

const PAPER = "#f8fafc";
const INK = "#10141a";
const INK_2 = "#51565c";
const INK_3 = "#6a6f75";
const RULE = "#d8dbdf";
const SIGNAL = "#ca7a00";

export const alt =
  "Meds Addis — pharmacist-verified prescriptions, same-day delivery and live courier tracking across Addis Ababa";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          fontFamily: "sans-serif",
        }}
      >
        {/* The regulatory band, exactly as it sits above the site header. */}
        <div style={{ width: "100%", height: 6, background: SIGNAL, display: "flex" }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 80px 56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Drawn mark in a solid ink square — the same construction as the
                header, not a font glyph that varies by platform. */}
            <div
              style={{
                width: 52,
                height: 52,
                background: INK,
                display: "flex",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  left: 13,
                  width: 26,
                  height: 4,
                  background: PAPER,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 13,
                  left: 24,
                  width: 4,
                  height: 26,
                  background: PAPER,
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginLeft: 20 }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  color: INK,
                  letterSpacing: "-1.2px",
                }}
              >
                Meds Addis
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: INK_3,
                  letterSpacing: "2.6px",
                  marginTop: 6,
                }}
              >
                PHARMACY &amp; DELIVERY
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 80,
                fontWeight: 600,
                color: INK,
                letterSpacing: "-4px",
                lineHeight: 1.02,
                maxWidth: 940,
              }}
            >
              Your pharmacy, without the queue.
            </div>

            <div
              style={{
                fontSize: 25,
                color: INK_2,
                marginTop: 28,
                maxWidth: 800,
                lineHeight: 1.45,
              }}
            >
              Pharmacist-verified prescriptions, same-day delivery, and live
              courier tracking across Addis Ababa.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{ width: "100%", height: 1, background: RULE, display: "flex" }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 14,
                color: INK_3,
                letterSpacing: "1.8px",
                marginTop: 22,
              }}
            >
              <span>ADDIS ABABA</span>
              <span style={{ margin: "0 16px", color: RULE }}>|</span>
              <span>09 11 22 33 44</span>
              <span style={{ margin: "0 16px", color: RULE }}>|</span>
              <span>OPEN 08:00–22:00</span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
