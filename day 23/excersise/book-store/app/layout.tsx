import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Addis Eats | Authentic Ethiopian Food & Books",
    template: "%s | Addis Eats",
  },
  description: "Browse and order authentic Ethiopian cuisine and cultural literature.",
  openGraph: {
    title: "Addis Eats",
    description: "Authentic Ethiopian cuisine and cultural literature.",
    siteName: "Addis Eats",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <header>
            <h1>Addis Eats & Book Store</h1>
            <p>Fresh Ethiopian dishes, cultural books & live delivery tracking</p>
          </header>

          <main id="main-content" tabIndex={-1}>
            {children}
          </main>

          <footer>
            <p>2026 Addis Eats &middot; IBT College Canada CodeOps</p>
          </footer>
        </Providers>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DEMO123"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}