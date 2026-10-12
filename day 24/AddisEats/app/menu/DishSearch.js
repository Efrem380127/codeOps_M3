"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import fetcher from "@/lib/fetcher";
import Icon from "@/app/components/Icon";

const PAGE_SIZE = 4;

/**
 * Debounced live search over the dish route handler.
 *
 * The previous version of this component was largely a status message: it
 * printed "Search box is idle. Type above or press Escape to reset." in the
 * resting state, and "Loading dishes..." while a request was in flight. Both
 * are instructions for operating the interface rather than information about
 * the menu, and they are the kind of filler that makes a page feel padded.
 *
 * Three details make the search itself behave:
 *
 *  1. The SWR key is `null` while the box is empty. A null key tells SWR not to
 *     fetch at all — without it, the empty string is a valid key and every
 *     keystroke would fire a request.
 *  2. The term is debounced by 300 ms, so typing "doro" issues one request
 *     rather than four.
 *  3. The previous term's results stay mounted while the next request is in
 *     flight, so the list does not flicker between keystrokes.
 */
export default function DishSearch() {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(term.trim());
      // A new term starts a new result set; staying on page 3 of the previous
      // one is how a search appears to return nothing.
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [term]);

  const key = debounced
    ? `/api/dishes?search=${encodeURIComponent(debounced)}&page=${page}&limit=${PAGE_SIZE}`
    : null;

  const { data, error, isLoading } = useSWR(key, fetcher, {
    keepPreviousData: true
  });

  const results = data?.dishes ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="sr-only" htmlFor="dish-search">
          Search dishes by name
        </label>

        <input
          id="dish-search"
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Doro, tibs, shiro&hellip;"
          autoComplete="off"
          aria-describedby="dish-search-status"
        />

        {term && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTerm("")}>
            Clear
          </button>
        )}
      </form>

      <div id="dish-search-status" className="mt-4" aria-live="polite">
        {!debounced && (
          <p className="small muted mb-0">
            Type a dish name. The search reads the name and the description, so
            &ldquo;berbere&rdquo; finds every dish that uses it.
          </p>
        )}

        {debounced && isLoading && !data && <p className="small muted mb-0">Searching&hellip;</p>}

        {error && (
          <p className="small mb-0" style={{ color: "var(--danger-ink)" }}>
            The search request failed. Check the connection and try again.
          </p>
        )}

        {debounced && data && results.length === 0 && (
          <p className="small muted mb-0">
            No dish matches &ldquo;{debounced}&rdquo;. Try a shorter word, or{" "}
            <Link href="/menu">browse the whole menu</Link>.
          </p>
        )}

        {results.length > 0 && (
          <>
            <p className="small muted">
              {data.total} {data.total === 1 ? "dish" : "dishes"} matching &ldquo;{debounced}&rdquo;
            </p>

            <ul className="data-list">
              {results.map((dish) => (
                <li key={dish.id}>
                  <span>
                    <Link href={`/menu/${dish.id}`}>{dish.name}</Link>
                    {dish.spicy && (
                      <>
                        {" "}
                        <Icon name="flame" style={{ color: "var(--signal)" }} />
                        {/* The icon is decorative; the fact it encodes is not. */}
                        <span className="sr-only">Spicy</span>
                      </>
                    )}
                  </span>
                  <span className="num">{dish.price} ETB</span>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="pager">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>

                <span className="pager__status">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
