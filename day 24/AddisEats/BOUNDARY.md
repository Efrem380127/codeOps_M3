# Addis Eats - Component Boundary Architecture

| Component | Path | Boundary | Justification |
|---|---|---|---|
| `RootLayout` | `app/layout.tsx` | **Server** | Renders outer HTML shell, imports static global CSS; needs no client interactivity. |
| `Providers` | `app/components/Providers.js` | **Client** | Wraps client-side React Context providers cleanly without turning `RootLayout` into a client component. |
| `CartProvider` | `app/components/CartProvider.js` | **Client** | Uses React Context (`createContext`, `useState`) to manage client-side cart state, and `sessionStorage` to survive a reload. |
| `CartLink` | `app/components/CartLink.js` | **Client** | Reads the live portion count from the cart context, so it re-renders as dishes are added. |
| `HomePage` | `app/page.tsx` | **Server** | Static landing page. Renders the hero, the featured dishes and the section copy with no hooks. |
| `FeaturedDishes` | `app/components/FeaturedDishes.js` | **Server** | Picks one dish per kitchen section from the catalogue and hands each to `FoodCard`. |
| `FoodCard` | `app/components/FoodCard.js` | **Client** | Leaf that holds the per-dish action state and the add-to-cart button, so the menu grid around it stays on the server. |
| `Icon` | `app/components/Icon.tsx` | **Server** | Inline SVG at a single stroke weight. No `"use client"`, no state, no hooks. |
| `MenuPage` | `app/menu/page.js` | **Server** | Reads the catalogue and filters it on the server; the dish grid ships as HTML. |
| `DishSearch` | `app/menu/DishSearch.js` | **Client** | Holds the search term in `useState`, debounces keystrokes, and cancels the in-flight request. |
| `DishPage` | `app/menu/[id]/page.js` | **Server (Async)** | Awaits dynamic route params and statically generates pre-rendered pages via `generateStaticParams`. |
| `CartPage` | `app/cart/page.js` | **Server** | Static page shell. The interactive basket lives in `CartContents`. |
| `CartContents` | `app/components/CartContents.js` | **Client** | Reads lines, quantities and totals from the cart context and calls `updateQuantity` and `removeItem`. |
| `CheckoutPage` | `app/checkout/page.js` | **Server** | Static shell; the form is a client component because it holds the pending and success state. |
| `CheckoutForm` | `app/checkout/CheckoutForm.js` | **Client** | `useActionState` for the server action, plus the cart payload it posts and the receipt it renders. |
| `OrdersPage` | `app/orders/page.js` | **Server (Async)** | Reads `searchParams`, awaits the session, and computes the revenue metrics on the server. |
| `LiveOrderStatus` | `app/order-status/LiveOrderStatus.js` | **Client** | Subscribes to the SSE driver stream and uses `useSyncExternalStore` for a hydration-safe clock. |
| `Error` | `app/menu/error.js` | **Client** | Next.js requires route error boundaries to be Client Components to handle runtime recovery (`reset()`). |
| `Loading` | `app/menu/loading.js` | **Server** | Pure fallback skeleton UI rendered by Next.js streaming boundary. |
| `NotFound` | `app/menu/not-found.js` | **Server** | Static 404 response UI. |
