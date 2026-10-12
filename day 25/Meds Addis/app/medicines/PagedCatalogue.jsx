"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { price } from "@/lib/format";

/**
 * Paged catalogue — TanStack Query.
 *
 * SWR and TanStack Query both appear in this application, deliberately, because
 * they are good at different things:
 *
 *   SWR (SearchBox, order status) is a thin cache around a fetch — ideal for
 *   polling and for keys that switch on and off.
 *
 *   TanStack Query (here) has first-class support for *replacing* a key's data
 *   while keeping the old data on screen. `placeholderData: keepPreviousData`
 *   is one line here; with SWR it is `keepPreviousData: true` plus manual
 *   bookkeeping of the previous key.
 *
 * The query key includes the page, so each page is cached separately and going
 * back to page 2 is instant.
 */
export default function PagedCatalogue() {
  const [page, setPage] = useState(1);

  const { data, error, isPending, isPlaceholderData } = useQuery({
    queryKey: ["medicines", "page", page],
    queryFn: async () => {
      const response = await fetch(`/api/medicines?page=${page}&pageSize=6`);

      if (!response.ok) {
        throw new Error(`Could not load page ${page}`);
      }

      return response.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  if (isPending) {
    return (
      <div className="card" role="status" aria-busy="true">
        <p className="mb-0">Loading the catalogue…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert--error">
        <div>
          <p className="alert__title">Could not load the catalogue</p>
          <p className="mb-0">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
        {data.medicines.map((medicine) => (
          <li
            key={medicine.id}
            className="between"
            style={{ borderBlockEnd: "1px solid var(--rule)", paddingBlockEnd: 8 }}
          >
            <span>
              <Link href={`/medicines/${medicine.id}`}>
                <strong>{medicine.name}</strong>
              </Link>{" "}
              <span className="small muted">
                {medicine.strength} · {medicine.packSize}
              </span>
            </span>

            <span className="price" style={{ fontSize: "var(--t-base)" }}>
              {price(medicine.price)}
            </span>
          </li>
        ))}
      </ul>

      <div className="pager">
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
        >
          Previous
        </button>

        <span className="pager__status">
          Page {data.page} of {data.totalPages}
          {isPlaceholderData && " · updating"}
        </span>

        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() =>
            setPage((current) => Math.min(data.totalPages, current + 1))
          }
          disabled={page >= data.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
