import Link from "next/link";

export const metadata = {
  title: "Page not found",
  description: "The page you were looking for does not exist.",
};

/**
 * Global 404. Rendered for any unmatched route and for any page that calls
 * notFound(). Kept deliberately useful: it offers the two routes that actually
 * help someone who mistyped a URL.
 */
export default function NotFound() {
  return (
    <main id="main" className="page container">
      <div className="state">
        <div className="state__icon" aria-hidden="true">
          ?
        </div>
        <h1>We could not find that page</h1>
        <p>
          The link may be out of date, or the page may have moved. The catalogue
          and your account are both still where you left them.
        </p>
        <div className="cluster">
          <Link className="btn btn--primary" href="/medicines">
            Browse medicines
          </Link>
          <Link className="btn btn--outline" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
