/**
 * robots.txt.
 *
 * The disallow list is the interesting half. Every route behind a session is
 * listed explicitly, because a crawler that follows a link into /orders would be
 * shown the sign-in redirect — harmless, but it wastes crawl budget and, worse,
 * a misconfigured matcher would expose real order pages to an index.
 *
 * /api/ is disallowed wholesale: those are JSON endpoints, not pages, and there
 * is nothing for a crawler to gain.
 *
 * The sitemap is declared so the public routes are discovered without guessing.
 */
export default function robots() {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/medicines", "/medicines/"],
        disallow: [
          "/api/",
          "/orders",
          "/orders/",
          "/track/",
          "/prescriptions",
          "/dispensary",
          "/dashboard",
          "/checkout",
          "/cart",
          "/sign-in",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
