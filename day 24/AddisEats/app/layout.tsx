import Link from "next/link";
import Image from "next/image";
import { Archivo, Caveat, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";
import AccountMenu from "./components/AccountMenu";
import CartLink from "./components/CartLink";
import ThemeToggle from "./components/ThemeToggle";

/**
 * Fonts are self-hosted by next/font at build time. The previous version of
 * this file pulled the same faces from fonts.googleapis.com with a <link> in
 * <head>, which is a render-blocking third-party request on every page load and
 * a privacy leak to a third party for no benefit. next/font downloads the files
 * at build time and serves them from our own origin.
 *
 * Archivo is both the display and the body face. At its heaviest weight, set
 * in uppercase with tight tracking, it carries every headline: the reference
 * direction is a heavy grotesque shouting from a stall sign, and the weight is
 * what does the shouting. The same family at normal weights carries running
 * text, so the page has one voice rather than two.
 *
 * Caveat is the script. It carries exactly one thing: the orange subline under
 * a section headline ("Cooked to order", "Three simple steps"). Used anywhere
 * else it would stop being an accent and start being a font choice.
 *
 * IBM Plex Mono is kept for one job only: numbers that have to line up in a
 * column on the kitchen ticket. It is not used for prices or labels, where
 * monospace was reading as instrument panel rather than as food.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap"
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"]
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"]
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://addis-eats-capstone.vercel.app"),
  title: {
    default: "Addis Eats | Authentic Ethiopian Food Delivery",
    template: "%s | Addis Eats"
  },
  description: "Order authentic Ethiopian cuisine in Addis Ababa. Fresh Doro Wat, Tibs, Shiro, and Beyainatu.",
  openGraph: {
    title: "Addis Eats",
    description: "Authentic Ethiopian cuisine delivered to your door.",
    siteName: "Addis Eats",
    locale: "en_US",
    type: "website"
  }
};

export const viewport = {
  /**
   * The browser chrome should match the page. Both values are the exact sRGB
   * equivalents of the `--paper` token in each theme, converted from oklch
   * rather than eyeballed, so the address bar and the page are the same colour.
   *
   * These are literal hex, not var(). themeColor is emitted as the content of
   * a <meta name="theme-color"> tag, which is a plain attribute value — var()
   * is not resolved there, and an earlier pass had left "var(--on-accent)" in
   * this slot, which is neither valid nor the right colour. The values below
   * are the computed sRGB for --paper in each scheme.
   */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcf9eb" },
    { media: "(prefers-color-scheme: dark)", color: "#071009" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${caveat.variable} ${plexMono.variable}`}
      // data-theme is written by the boot script above, which React cannot know
      // about at render time. Suppressing the warning here is correct: the
      // mismatch is intentional and already resolved before hydration.
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />

        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <header className="site-header">
            <div className="header-container">
              <Link href="/" className="brand-title">
                {/* The client's own pot mark. Decorative, so it is hidden from
                    assistive tech: the link text "Addis Eats" is the label. */}
                <Image
                  src="/logo/addis-eats-mark.png"
                  alt=""
                  width={30}
                  height={30}
                  className="brand-mark-img"
                  priority
                />
                Addis Eats
              </Link>

              <nav className="header-nav" aria-label="Main Navigation">
                <Link href="/menu">Menu</Link>
                <Link href="/orders">Orders</Link>
                <Link href="/order-status">Live Status</Link>
                <Link href="/kitchen">Kitchen</Link>
                <AccountMenu />
                <ThemeToggle />
                <CartLink />
              </nav>
            </div>
          </header>

          <main id="main-content" tabIndex={-1}>
            {children}
          </main>

          <footer>
            <p>Addis Eats Ethiopia</p>
          </footer>
        </Providers>

        {/*
          A Google Analytics snippet with a placeholder measurement ID
          (G-ADDISEATS123) used to load here. It was making a real third-party
          request on every page load, for an ID that does not exist, and logging
          a console error. Removed: it cost the visitor network time and
          collected nothing.
        */}
      </body>
    </html>
  );
}
