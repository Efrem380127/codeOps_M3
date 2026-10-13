import Icon from "./Icon";

/**
 * Header search.
 *
 * A plain GET form, deliberately. `<form action="/medicines">` with a named
 * input means the search works with JavaScript disabled, before hydration, and
 * with the browser's own autocomplete — none of which a `useRouter().push()`
 * handler gives you. The catalogue already reads `q` from searchParams, so the
 * server does the rest.
 *
 * It is a Server Component for that reason, and it is also what keeps the
 * header out of the client bundle.
 *
 * The input is intentionally uncontrolled and does not echo the current query:
 * reading searchParams in the layout would opt every route in the application
 * into dynamic rendering, which is exactly what the catalogue's static/ISR
 * rendering cannot afford. The trade is one empty field on /medicines rather
 * than a dynamic root layout.
 */
export default function SearchBar({ className = "" }) {
  return (
    <form
      className={className ? `search-bar ${className}` : "search-bar"}
      action="/medicines"
      method="get"
      role="search"
    >
      <Icon name="search" className="search-bar__glyph" />

      <label className="visually-hidden" htmlFor="site-search">
        Search medicines and health products
      </label>
      <input
        id="site-search"
        className="search-bar__input"
        type="search"
        name="q"
        placeholder="Search medicines, health products…"
        autoComplete="off"
      />

      <button className="search-bar__submit" type="submit" aria-label="Search">
        <Icon name="search" />
      </button>
    </form>
  );
}
