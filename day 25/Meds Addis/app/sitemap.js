import { medicineIds } from "@/lib/catalog";

/**
 * sitemap.xml, generated from the catalogue.
 *
 * The rule that matters: PUBLIC routes only. /orders, /dispensary, /dashboard,
 * /checkout and /prescriptions are all behind a session and none of them appear
 * here. Listing a private route in a sitemap is how it ends up in an index, and
 * an indexed order page is a privacy incident, not an SEO win.
 *
 * Medicine detail pages are included because they are genuinely public and are
 * the pages someone would search for by name.
 */
export default function sitemap() {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/medicines", priority: 0.9, changeFrequency: "daily" },
    { path: "/sign-in", priority: 0.3, changeFrequency: "yearly" },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),

    ...medicineIds().map((id) => ({
      url: `${base}/medicines/${id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}
