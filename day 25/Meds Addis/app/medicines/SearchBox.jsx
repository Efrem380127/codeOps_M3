"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import fetcher from "@/lib/fetcher";
import { price } from "@/lib/format";

/**
 * Debounced live search.
 *
 * Three details that make this behave:
 *
 *  1. The SWR key is `null` while the box is empty. A null key tells SWR not to
 *     fetch at all — without it, every keystroke including the empty string
 *     would fire a request.
 *  2. The term is debounced by 300 ms, so typing "paracetamol" issues one
 *     request rather than eleven.
 *  3. The previous term's results stay mounted while the next request is in
 *     flight, so the list does not flicker between keystrokes.
 *
 * The input is inside a real <form> with onSubmit prevented, which keeps the
 * browser's native form behaviour (Enter does not reload the page) and means
 * the control is still usable with JavaScript-free submit semantics.
 */
export default function SearchBox() {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const key = debounced
    ? `/api/medicines?q=${encodeURIComponent(debounced)}&pageSize=5`
    : null;

  const { data, error, isLoading } = useSWR(key, fetcher, {
    keepPreviousData: true,
  });

  const results = data?.medicines ?? [];

  return (
    <div className="card">
      <form className="search" onSubmit={(event) => event.preventDefault()}>
        <label className="visually-hidden" htmlFor="medicine-search">
          Search medicines
        </label>

        <input
          id="medicine-search"
          className="input"
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search by brand or generic name…"
          autoComplete="off"
          aria-describedby="search-status"
        />

        {term && (
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => setTerm("")}
          >
            Clear
          </button>
        )}
      </form>

      <div id="search-status" className="mt-4" aria-live="polite">
        {!debounced && (
          <p className="small muted mb-0">Start typing to search the catalogue.</p>
        )}

        {debounced && isLoading && !data && (
          <p className="small muted mb-0">Searching…</p>
        )}

        {error && (
          <div className="alert alert--error">
            <div>
              <p className="alert__title">Search failed</p>
              <p className="mb-0">{error.message}</p>
            </div>
          </div>
        )}

        {debounced && data && results.length === 0 && (
          <p className="small muted mb-0">
            No medicine matches “{debounced}”. Try the generic name.
          </p>
        )}

        {results.length > 0 && (
          <>
            <p className="small muted">
              {data.total} result{data.total === 1 ? "" : "s"} for “{debounced}”
            </p>

            <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
              {results.map((medicine) => (
                <li key={medicine.id}>
                  <Link href={`/medicines/${medicine.id}`}>
                    <strong>{medicine.name}</strong>
                  </Link>{" "}
                  <span className="small muted">
                    {medicine.genericName} · {medicine.strength} ·{" "}
                    {price(medicine.price)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
