import Link from "next/link";

/**
 * Category filter.
 *
 * Server-rendered links rather than client buttons, because the filter lives
 * in the URL. That buys three things a `useState` filter does not:
 *
 *   - The filtered view is shareable and bookmarkable.
 *   - The browser back button works.
 *   - The page can be rendered on the server, so the filter costs no JavaScript
 *     and the result is crawlable.
 *
 * State that belongs in the URL should live in the URL.
 *
 * The Offers chip is a toggle over the same axis rather than a separate one, so
 * it composes with the active category and the search term instead of clearing
 * them — and every chip carries the other two, which is what keeps the filter
 * state from silently resetting when you move between them.
 */
export default function CategoryFilter({
  categories,
  active = "",
  query = "",
  offers = false,
}) {
  const buildHref = ({ category = active, withOffers = offers } = {}) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query) params.set("q", query);
    if (withOffers) params.set("offers", "1");
    const search = params.toString();
    return search ? `/medicines?${search}` : "/medicines";
  };

  return (
    <nav className="filters" aria-label="Filter by category">
      <Link
        className="chip"
        href={buildHref({ category: "" })}
        data-active={active === "" ? "true" : "false"}
        aria-current={active === "" ? "true" : undefined}
      >
        All
      </Link>

      {categories.map((category) => (
        <Link
          key={category}
          className="chip"
          href={buildHref({ category })}
          data-active={active === category ? "true" : "false"}
          aria-current={active === category ? "true" : undefined}
        >
          {category}
        </Link>
      ))}

      <Link
        className="chip chip--offers"
        href={buildHref({ withOffers: !offers })}
        data-active={offers ? "true" : "false"}
        aria-current={offers ? "true" : undefined}
      >
        Offers only
      </Link>
    </nav>
  );
}
