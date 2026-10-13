import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Providers from "@/app/providers";

/**
 * Fonts are self-hosted by next/font at build time, which means: no render-
 * blocking request to fonts.googleapis.com, no layout shift from a late font
 * swap, and no third-party request in the visitor's network tab.
 *
 * Plus Jakarta Sans is the family the reference design sets everything in — a
 * geometric sans with slightly rounded terminals and a tall x-height, which is
 * what gives a consumer storefront its friendly, high-legibility tone. It
 * replaced Archivo when the interface moved from the Clinical Swiss direction
 * to the reference's.
 *
 * IBM Plex Mono is retained, but only for identifiers — order numbers, batch
 * codes, the dashboard's tabular figures. The reference sets no mono at all,
 * and nowhere that a number is merely decorative uses it.
 */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const metadata = {
  /**
   * metadataBase is what turns every relative image path below into an absolute
   * URL. Without it, `opengraph-image.js` produces a relative path and every
   * link preview — WhatsApp, Telegram, LinkedIn — renders with no picture.
   */
  metadataBase: new URL(siteUrl),
  title: {
    default: "Meds Addis — Online Pharmacy & Same-Day Delivery",
    template: "%s | Meds Addis",
  },
  description:
    "Order genuine medicines online in Addis Ababa. Prescription upload, pharmacist verification, cold-chain-safe delivery and live courier tracking.",
  applicationName: "Meds Addis",
  keywords: [
    "pharmacy Addis Ababa",
    "online medicine delivery Ethiopia",
    "prescription upload",
    "Ethiopian pharmacy",
    "medicine delivery",
  ],
  authors: [{ name: "Meds Addis" }],
  creator: "Meds Addis",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Meds Addis",
    title: "Meds Addis — Online Pharmacy & Same-Day Delivery",
    description:
      "Genuine medicines, pharmacist-verified prescriptions and live courier tracking across Addis Ababa.",
    url: siteUrl,
    locale: "en_ET",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meds Addis — Online Pharmacy & Same-Day Delivery",
    description:
      "Genuine medicines, pharmacist-verified prescriptions and live courier tracking across Addis Ababa.",
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: { telephone: true, address: true },
};

export const viewport = {
  /**
   * The browser chrome should match the page. Both values are the exact sRGB
   * equivalents of the `--paper` token in each theme, converted from oklch
   * rather than eyeballed, so the address bar and the page are the same colour.
   */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c10" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

/**
 * Runs before the browser paints, so the correct theme is already on <html>
 * when the first frame is drawn. Without this, a visitor who chose dark would
 * see a white flash on every navigation.
 *
 * Deliberately tiny and dependency-free: it is render-blocking by design, and
 * it is wrapped in try/catch because localStorage throws in Safari's private
 * mode. When it throws, the OS preference wins, which is the right fallback.
 */
const THEME_BOOT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${plexMono.variable}`}
      // data-theme is written by the boot script above, which React cannot know
      // about at render time. Suppressing the warning here is correct: the
      // mismatch is intentional and already resolved before hydration.
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />

        {/*
          First focusable element on the page. Keyboard users land here and can
          jump past the header nav without tabbing through every link.
        */}
        <a className="skip-link" href="#main">
          Skip to main content
        </a>

        {/*
          Providers wraps the header as well as the page content.

          This is load-bearing, not tidiness. <Header> renders <CartLink>, which
          calls useCart() — and useCart() throws when there is no CartProvider
          above it. With the header outside this wrapper, every statically
          prerendered route fails at build time with "useCart must be used
          inside a <CartProvider>".

          The children passed in here are still server-rendered: this wrapper is
          a Client Component, but `children` arrives as an already-rendered
          value, so nothing below it is dragged into the client bundle.
        */}
        <Providers>
          <Header />

          {children}

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
