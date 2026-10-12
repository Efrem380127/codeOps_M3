"use client";

/**
 * TanStack Query provider — scoped to the one route that uses it.
 *
 * This lives in the route folder rather than in app/providers.jsx on purpose.
 * Next.js builds a separate client bundle per route, so a provider imported
 * only here puts TanStack Query in the /medicines chunk and nowhere else.
 * Hoisting it to the root layout would put the whole library in the shared
 * chunk and charge every page for it — including the 404 page.
 *
 * The only consumer is <PagedCatalogue>, which uses `placeholderData:
 * keepPreviousData` so changing page swaps the rows without unmounting the
 * grid or flashing a loading state.
 */
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function CatalogueQueryProvider({ children }) {
  /*
   * useState rather than a module-level constant: in a Client Component the
   * module scope is shared across requests during SSR, and a single QueryClient
   * shared between two users would leak one user's cached data into the other's
   * render.
   */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
