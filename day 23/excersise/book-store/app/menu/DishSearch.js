"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

export default function DishSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [term, setTerm] = useState(searchParams.get("search") || "");
  const [debouncedTerm, setDebouncedTerm] = useState(term);

  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(term);
    }, 300);
    return () => clearTimeout(timer);
  }, [term]);

  const key = debouncedTerm.trim()
    ? `/api/dishes?search=${encodeURIComponent(debouncedTerm.trim())}&page=${page}`
    : null;

  const { data, isValidating } = useSWR(key, fetcher, {
    keepPreviousData: true
  });

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setTerm(val);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (val.trim()) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setTerm("");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  };

  const setPage = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  return (
    <div style={{ margin: "1.5rem 0", maxWidth: "560px" }}>
      <h2 style={{ fontSize: "1.25rem", color: "#0f172a", marginBottom: "0.5rem" }}>
        Search Dishes
      </h2>
      <label htmlFor="dish-search-input" style={{ display: "block", fontSize: "0.875rem", color: "#475569", marginBottom: "0.35rem" }}>
        Filter by keyword (Press Escape to clear)
      </label>
      <input
        id="dish-search-input"
        type="search"
        value={term}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        placeholder="Type to search (e.g. Wat, Tibs, Shiro)..."
        style={{
          width: "100%",
          minHeight: "44px",
          padding: "0.625rem 0.875rem",
          border: "1px solid #cbd5e1",
          borderRadius: "6px",
          marginBottom: "1rem",
          fontSize: "0.9375rem"
        }}
      />

      {!debouncedTerm.trim() ? (
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Search box is idle. Type above or press Escape to reset.
        </p>
      ) : !data ? (
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading dishes...</p>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ margin: 0, fontWeight: 600, color: "#1e293b", fontSize: "0.875rem" }}>
              Found {data.total} {data.total === 1 ? "dish" : "dishes"}
            </p>
            {isValidating && <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>Updating...</span>}
          </div>

          {data.dishes.length === 0 ? (
            <p style={{ marginTop: "1rem", color: "#64748b", fontSize: "0.875rem" }}>
              No dishes match &quot;{debouncedTerm}&quot;.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {data.dishes.map((dish) => (
                <li
                  key={dish.id}
                  style={{
                    padding: "0.75rem 1rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>
                    <strong style={{ color: "#0f172a" }}>{dish.name}</strong> {dish.spicy && "🌶️"}
                  </span>
                  <span style={{ fontWeight: "700", color: "#b45309" }}>{dish.price} ETB</span>
                </li>
              ))}
            </ul>
          )}

          {data.totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                aria-label="Go to previous page"
                style={{
                  minHeight: "44px",
                  minWidth: "44px",
                  padding: "0.5rem 1rem",
                  cursor: page <= 1 ? "not-allowed" : "pointer"
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}>
                Page {page} of {data.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
                aria-label="Go to next page"
                style={{
                  minHeight: "44px",
                  minWidth: "44px",
                  padding: "0.5rem 1rem",
                  cursor: page >= data.totalPages ? "not-allowed" : "pointer"
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
