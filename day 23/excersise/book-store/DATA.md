# SEO, Metadata & Search Engine Indexing

> Reference notes retained from **D44 · Metadata & SEO**. The metadata, OpenGraph,
> JSON-LD, sitemap and robots layer described here is present and live in this application.

Notes on setting up global and route-level metadata, dynamic OpenGraph generation with `ImageResponse`, Schema.org structured data, dynamic sitemaps, and robots directives in the Next.js App Router.

---

## 1. Global Metadata & Title Template (`app/layout.tsx`)
In `app/layout.tsx`, root metadata was defined using `metadataBase` and a title template:
```tsx
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
```
- **`metadataBase`**: Essential for resolving relative OpenGraph images, canonical URLs, and sitemaps into fully qualified URLs (e.g. `http://localhost:3000/opengraph-image`).
- **`title.template`**: `%s | Book Store` automatically formats child page titles (e.g. `Catalog` becomes `Catalog | Book Store`).
- **`title.default`**: Provides the fallback title for routes that do not define their own.

---

## 2. Static Route Metadata
Every static route was given a human-written, descriptive title and meta description:

- **Home (`/`)**:
  - Title: `Home` (`Home | Book Store`)
  - Description: *"Welcome to Book Store. Browse fiction, science and history titles."*
- **Menu (`/menu`)**:
  - Title: `Catalog`
  - Description: *"Explore the catalogue of fiction, science and history titles."*
- **Cart (`/cart`)**:
  - Title: `Shopping Cart`
  - Description: *"Review your selected books, adjust quantities, and proceed to checkout."*
- **Checkout (`/checkout`)**:
  - Title: `Secure Checkout`
  - Description: *"Provide delivery details and securely complete your Book Store order."*
- **Order Status (`/order-status`)**:
  - Title: `Live Order Status`
  - Description: *"Track real-time dispatch progress and estimated delivery times for your Book Store orders."*
- **Orders (`/orders`)**:
  - Title: `Order History`
  - Description: *"View your past orders, delivery receipts, and current dispatch details."*
- **Sign In (`/sign-in`)**:
  - Title: `Sign In`
  - Description: *"Sign in to your Book Store account to manage orders and track dispatch status."*
- **Dispatch (`/dispatch`)**:
  - Title: `Dispatch Dashboard`
  - Description: *"Staff portal for monitoring incoming orders and dispatch ticket fulfillment."*

---

## 3. Dynamic Metadata on Book Route (`app/menu/[id]/page.js`)
The dynamic book route defines `generateMetadata` using the book's `name`, `price`, and `summary`:
```js
export async function generateMetadata({ params }) {
  const { id } = await params;
  const book = books.find((d) => String(d.id) === String(id));

  if (!book) {
    return {
      title: "Book Not Found",
      description: "The requested book could not be found.",
    };
  }

  return {
    title: `${book.name} - ${book.price} ETB`,
    description: book.summary,
    openGraph: {
      title: `${book.name} - ${book.price} ETB`,
      description: book.summary,
      images: [
        {
          url: `/menu/${book.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${book.name} at Book Store`,
        },
      ],
    },
  };
}
```
- Browsing to `/menu/1` produces the title: `Things Fall Apart - 320 ETB | Book Store`.
- Meta description dynamically reflects the authentic book summary.

---

## 4. OpenGraph Images with `ImageResponse`
Two OpenGraph generators were implemented using `next/og`:

1. **Site-wide OpenGraph Image (`app/opengraph-image.js`)**:
   - Generates a 1200x630 banner with branding and subtitle.
   - Automatically mapped to `/opengraph-image` and linked in `<head>` via `<meta property="og:image" content="...">`.
2. **Per-Book OpenGraph Image (`app/menu/[id]/opengraph-image.js`)**:
   - Reads the dynamic route `id` and renders a customized social card with book name, price in ETB, and summary.
   - Served at `/menu/[id]/opengraph-image` for social sharing previews (Twitter/X, WhatsApp, LinkedIn, iMessage).

---

## 5. Schema.org `MenuItem` JSON-LD Structured Data
In `app/menu/[id]/page.js`, structured data is generated from the exact same `book` object rendered on the page:
```jsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MenuItem",
  name: book.name,
  description: book.summary,
  offers: {
    "@type": "Offer",
    price: book.price,
    priceCurrency: "ETB",
  },
  image: book.image,
};

return (
  <div>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    ...
  </div>
);
```
- Enables Google and other search engines to parse rich menu cards, pricing, and food descriptions directly from the HTML source without executing client-side scripts.

---

## 6. Dynamic Sitemap (`app/sitemap.js`)
`app/sitemap.js` generates search-crawlable URLs while explicitly excluding private/authenticated routes:
```js
import { books } from "./data/books";

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/menu`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/order-status`, lastModified: new Date(), changeFrequency: "always", priority: 0.5 },
  ];

  const bookRoutes = books.map((book) => ({
    url: `${baseUrl}/menu/${book.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...bookRoutes];
}
```
- **Included**: `/`, `/menu`, `/order-status`, and dynamic `/menu/1` through `/menu/9`.
- **Excluded**: `/cart`, `/checkout`, `/orders`, `/dispatch`, `/sign-in`.

---

## 7. Crawl Directives (`app/robots.js`)
`app/robots.js` prevents crawlers from indexing transactional and private routes, and references the dynamic sitemap:
```js
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/orders", "/dispatch", "/sign-in"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## 8. View-Source Verification Checklist
Verified against the running production server source output:
1. `<title>` on `/menu/1` renders as `Things Fall Apart - 320 ETB | Book Store`.
2. `<meta name="description" content="...">` renders with book summary.
3. `<meta property="og:image" content="http://localhost:3000/menu/1/opengraph-image">` is present.
4. `<script type="application/ld+json">` contains valid `@type: "MenuItem"` markup.
5. `GET /sitemap.xml` responds with XML listing all books and omitting private routes.
6. `GET /robots.txt` outputs `Disallow: /cart` and `Disallow: /checkout` pointing to `Sitemap: http://localhost:3000/sitemap.xml`.
