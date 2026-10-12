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
    default: "Book Store | Fiction, Science & History",
    template: "%s | Book Store",
  },
  description: "Browse and buy books across fiction, science and history.",
  openGraph: {
    title: "Book Store",
    description: "Fiction, science and history books.",
    siteName: "Book Store",
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
            <h1>Book Store</h1>
            <p>Books across fiction, science & history, with live delivery tracking</p>
          </header>

          <main id="main-content" tabIndex={-1}>
            {children}
          </main>

          <footer>
            <p>2026 Book Store &middot; IBT College Canada CodeOps</p>
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