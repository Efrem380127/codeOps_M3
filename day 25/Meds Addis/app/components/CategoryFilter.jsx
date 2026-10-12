import Link from "next/link";

/**
 * Category filter.
 *
 * Server-rendered links rather than client buttons, because the filter lives in
 * the URL. That buys three things a `useState` filter does not:
 *
 *   - The filtered view is shareable and bookmarkable.
 *   - The browser back button works.
 *   - The page can be rendered on the server, so the filter costs no JavaScript
 *     and the result is crawlable.
 *
 * State that belongs in the URL should live in the URL.
 */
export default function CategoryFilter({ categories, active = "", query = "" }) {
  const buildHref = (category) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query) params.set("q", query);
    const search = params.toString();
    return search ? `/medicines?${search}` : "/medicines";
  };

  return (
    <nav className="filters" aria-label="Filter by category">
      <Link
        className="chip"
        href={buildHref("")}
        data-active={active === "" ? "true" : "false"}
        aria-current={active === "" ? "true" : undefined}
      >
        All
      </Link>

      {categories.map((category) => (
        <Link
          key={category}
          className="chip"
          href={buildHref(category)}
          data-active={active === category ? "true" : "false"}
          aria-current={active === category ? "true" : undefined}
        >
          {category}
        </Link>
      ))}
    </nav>
  );
}
