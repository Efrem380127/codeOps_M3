# Rendering Strategy & Route Architecture

Classified from the actual `npm run build` output. Next.js prints a symbol per
route: `○` static, `●` SSG via `generateStaticParams`, `ƒ` server-rendered on
demand.

| Route | Build Output | Strategy | Reason |
|---|---|---|---|
| `/` | `○` Static | Static | The landing page renders the hero, the featured dishes and the section copy. Nothing in it depends on the request. |
| `/menu` | `ƒ` Dynamic | Server-rendered on demand | The page reads `searchParams` so the kitchen-section filter can live in the URL (`/?category=vegan`), which is what keeps the view shareable and back-button friendly. |
| `/menu/[id]` | `●` SSG | Pre-rendered at build time via `generateStaticParams` | All 9 dishes are known at build time, so every detail page is generated as static HTML. |
| `/cart` | `○` Static | Static | The shell is static. The basket itself is client state in `CartContents`. |
| `/checkout` | `○` Static | Static | The page shell is static; the form is a client component that posts through a server action. |
| `/orders` | `ƒ` Dynamic | Server-rendered on demand | Reads `searchParams` for sort, page and the state demos, and reads the session to scope the list. |
| `/orders/[id]` | `ƒ` Dynamic | Server-rendered on demand | Reads the route param and the session, then applies the ownership gate before rendering. |
| `/order-status` | `ƒ` Dynamic | Server-rendered on demand | Reads `searchParams` for the order id and seeds the client poll with `fallbackData`. |
| `/kitchen` | `ƒ` Dynamic | Server-rendered on demand | Reads the session; redirects signed-out visitors and refuses non-staff roles. |
| `/sign-in` | `ƒ` Dynamic | Server-rendered on demand | Reads `searchParams` for the `next` destination. |
| `/opengraph-image`, `/icon.png`, `/robots.txt`, `/sitemap.xml` | `○` Static | Static | Generated at build time. |
| `/api/*` | `ƒ` Dynamic | Route handlers | Read the request (query params, session, or the SSE stream). |

## Why there is no ISR here

An earlier draft of this document claimed `/menu` used ISR with a 60-second
revalidate window. That is not what the code does: there is no
`export const revalidate` on any route, and `/menu` is dynamic because it reads
`searchParams`. A category filter held in the URL means the response varies per
request, so a shared cache entry would serve the wrong filter.
