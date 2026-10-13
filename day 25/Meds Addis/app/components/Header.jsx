import Image from "next/image";
import Link from "next/link";

import CategoryNav from "./CategoryNav";
import SearchBar from "./SearchBar";
import CartLink from "./CartLink";
import AccountMenu from "./AccountMenu";
import ThemeToggle from "./ThemeToggle";
import Icon from "./Icon";

/**
 * Site header — the reference's two-row arrangement.
 *
 *   Row 1  brand · search · upload-prescription · account · cart
 *   Row 2  the category bar
 *
 * Deliberately a Server Component that reads NO cookies. If it called
 * getSession() it would opt every route in the application into dynamic
 * rendering, and the catalogue — which should be static with ISR — would be
 * rebuilt per request for no reason.
 *
 * The account state lives in <AccountMenu>, a small Client Component that
 * fetches it after hydration. The cost is one lightweight request; the benefit
 * is that /medicines stays ○ (Static) with revalidate.
 *
 * The previous version carried a hamburger disclosure for the primary nav.
 * That is gone: the category bar below covers the same need with real links,
 * needs no JavaScript, and has no open/closed state that can be left over from
 * a mobile visit and then hide the nav on a wide screen.
 */
export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <Link className="brand" href="/">
          {/* The supplied mark. `alt=""` because the wordmark beside it already
              carries the accessible name — a second reading of "Meds Addis"
              would just make a screen reader say it twice. `priority` because
              it is in the first viewport on every route. */}
          <Image
            className="brand__mark"
            src="/logo/medaddis-mark.png"
            alt=""
            width={148}
            height={192}
            sizes="38px"
            priority
          />
          <span className="brand__text">
            Meds Addis
            <span className="brand__sub">Pharmacy &amp; delivery</span>
          </span>
        </Link>

        <SearchBar />

        <div className="site-header__actions">
          <Link
            className="header-action"
            href="/prescriptions"
            aria-label="Upload prescription"
          >
            <Icon name="upload" />
            <span className="header-action__label">Upload prescription</span>
          </Link>

          <AccountMenu />

          <ThemeToggle />

          <CartLink />
        </div>
      </div>

      <CategoryNav />
    </header>
  );
}
