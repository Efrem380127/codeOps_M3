import Link from "next/link";

import { categories } from "@/lib/catalog";

/**
 * The category bar under the header.
 *
 * Every item is a real link to a filtered, shareable URL — the same axis the
 * catalogue page filters on, rather than a second, decorative taxonomy that
 * could drift from it.
 *
 * It replaces the previous disclosure menu (a hamburger that opened a panel on
 * mobile). A horizontally scrollable row of links is reachable by keyboard,
 * needs no JavaScript and no open/closed state to get out of sync, and on a
 * narrow screen it simply scrolls. `overflow-x: auto` on the row is what makes
 * that work; the scrollbar is hidden but the row stays focus-scrollable.
 */
export default function CategoryNav() {
  return (
    <nav className="cat-nav" aria-label="Shop by category">
      <div className="container cat-nav__inner">
        <Link className="cat-nav__link" href="/medicines">
          All medicines
        </Link>

        {categories.map((category) => (
          <Link
            key={category}
            className="cat-nav__link"
            href={`/medicines?category=${encodeURIComponent(category)}`}
          >
            {category}
          </Link>
        ))}

        <Link className="cat-nav__link" href="/medicines?offers=1">
          Offers
          <span className="cat-nav__badge">New</span>
        </Link>
      </div>
    </nav>
  );
}
