import Link from "next/link";

import Navbar from "./Navbar";
import CartLink from "./CartLink";
import AccountMenu from "./AccountMenu";
import ThemeToggle from "./ThemeToggle";
import Icon from "./Icon";

/**
 * Site header.
 *
 * Deliberately a Server Component that reads NO cookies. If it called
 * getSession() it would opt every route in the application into dynamic
 * rendering, and the catalogue — which should be static with ISR — would be
 * rebuilt per request for no reason.
 *
 * The account state lives in <AccountMenu>, a small Client Component that
 * fetches it after hydration. The cost is one lightweight request; the benefit
 * is that /medicines stays ○ (Static) with revalidate.
 */
export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <Link className="brand" href="/">
          {/* Was a gradient tile holding the ✚ character. Now a drawn mark in
              a solid ink square — a pharmacy cross should be a shape, not a
              font glyph that renders differently on every platform. */}
          <span className="brand__mark" aria-hidden="true">
            <Icon name="plus" />
          </span>
          <span className="brand__text">
            Meds Addis
            <span className="brand__sub">Pharmacy &amp; delivery</span>
          </span>
        </Link>

        <Navbar />

        <AccountMenu />

        <ThemeToggle />

        <CartLink />
      </div>
    </header>
  );
}
