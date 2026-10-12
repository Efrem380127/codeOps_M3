"use client";

/**
 * Client providers, wrapped around the server-rendered children.
 *
 * This is the composition pattern that keeps the boundary narrow: `children` is
 * passed through from the server, so the pages themselves stay Server
 * Components even though this wrapper is a Client Component. Nothing below here
 * is dragged into the client bundle by being a descendant of it.
 *
 * ONE provider, deliberately.
 *
 * This file used to also mount `QueryClientProvider`. That was a measurable
 * mistake: TanStack Query is used by exactly one component in the whole
 * application (app/medicines/PagedCatalogue.jsx), but a provider in the root
 * layout puts the library in the *shared* chunk, so every route paid for it —
 * including /cart, /orders, /sign-in and the 404 page, none of which query
 * anything. Moving the provider down to the route that needs it took ~40 KB of
 * uncompressed JavaScript off every page that is not /medicines. See PERF.md.
 *
 * The rule this illustrates: a provider belongs at the lowest point in the tree
 * that still covers all of its consumers — never at the root "just in case".
 *
 * CartProvider is different, and stays here: the cart is read by the header on
 * every route, so its provider genuinely does need to be global.
 *
 * SWR needs no provider at all, which is part of why the polling and streaming
 * reads use it rather than TanStack Query.
 */

import { CartProvider } from "@/app/components/CartProvider";

export default function Providers({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
