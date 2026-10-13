import { Suspense } from "react";

import CategoryFilter from "@/app/components/CategoryFilter";
import FilterShell from "@/app/components/FilterShell";
import Icon from "@/app/components/Icon";
import MedicineList from "@/app/components/MedicineList";
import MedicineSkeleton from "@/app/components/MedicineSkeleton";
import SearchBox from "./SearchBox";
import PagedCatalogue from "./PagedCatalogue";
import CatalogueQueryProvider from "./CatalogueQueryProvider";
import { categories } from "@/lib/catalog";

/**
 * Rendering strategy: DYNAMIC, with a streamed shell.
 *
 * This route reads `searchParams`, which is a Dynamic API — its value cannot be
 * known at build time — so Next.js renders it per request and the build output
 * lists it as ƒ. That is expected, and it was measured rather than assumed:
 * passing the `searchParams` *promise* down to a Suspense child does **not**
 * make the route static. Next.js still classifies the whole route as dynamic,
 * because the page's props contain a Dynamic API. Only Partial Prerendering
 * (`experimental.ppr`) would keep the shell prerendered, and it is not enabled
 * here.
 *
 * What the Suspense boundary below *does* buy is streaming. The shell — the
 * heading, the search panel, the paged browser — is serialised and flushed to
 * the browser while <CatalogueResults> is still resolving, so the visitor sees
 * the page frame immediately instead of a blank document. The filter chips and
 * the results grid fill in behind it.
 *
 * The alternative — a fully static route — means moving filtering into the
 * client: fetch the catalogue once and filter in a `useMemo`. That trades
 * crawlable, shareable filter URLs (the chips are real links, see
 * app/components/CategoryFilter.jsx) for a static document. The wrong trade for
 * a catalogue page, which is why this route is dynamic and stays dynamic.
 *
 * NOTE: there is deliberately no `export const revalidate` here. An earlier
 * version had `revalidate = 60` and it was a no-op — the deployed route returns
 * `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`,
 * because a route that reads `searchParams` is never cached. Declaring a
 * revalidation window that cannot take effect is worse than declaring nothing:
 * it reads as a caching strategy that does not exist. Verified against the
 * production response headers, not assumed.
 */
export const metadata = {
  title: "Medicines",
  description:
    "Browse antibiotics, pain relief, antimalarials, diabetes care, cardiovascular and dermatology medicines. Stock levels and pack sizes shown on every card.",
  alternates: { canonical: "/medicines" },
};

export default function MedicinesPage({ searchParams }) {
  return (
    <main id="main" className="page container">
      {/* --- Static shell: prerendered once, revalidated every 60s --- */}

      <div className="section-head">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1>Medicines</h1>
          <p className="lede mt-2">
            Sixteen lines across nine therapeutic categories. Items marked{" "}
            <span className="badge badge--rx">
              <Icon name="capsule" /> Prescription required
            </span>{" "}
            are dispensed only after a pharmacist has verified a prescription.
          </p>
        </div>
      </div>

      {/*
        --- Dynamic hole: the only part that reads searchParams ---

        The fallback mirrors the real layout (a row of chips, then a grid of
        cards) so the swap does not shift anything on screen.
      */}
      <Suspense fallback={<CatalogueFallback />}>
        <CatalogueResults searchParams={searchParams} />
      </Suspense>

      <section className="section mt-6">
        <div className="section-head">
          <div>
            <span className="eyebrow">Live search</span>
            <h2>Search the catalogue</h2>
            <p>
              Searches the brand name, the generic name and the tags, so
              &ldquo;Amoxil&rdquo; and &ldquo;amoxicillin&rdquo; both find the
              same medicine.
            </p>
          </div>
        </div>

        <SearchBox />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Paged</span>
            <h2>Browse page by page</h2>
            <p>
              The same catalogue fetched from the route handler, paged six at a
              time. Changing page keeps the previous results on screen instead of
              flashing a loading state.
            </p>
          </div>
        </div>

        <CatalogueQueryProvider>
          <PagedCatalogue />
        </CatalogueQueryProvider>
      </section>
    </main>
  );
}

/**
 * The dynamic hole.
 *
 * This is an Async Server Component, and it is the only thing in the tree that
 * awaits `searchParams`. Because it sits inside its own Suspense boundary, the
 * rest of the page can be sent from the edge cache immediately and React fills
 * this section in when the request's params resolve.
 */
async function CatalogueResults({ searchParams }) {
  // searchParams is a Promise in the App Router — it must be awaited.
  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q : "";
  const category = typeof params?.category === "string" ? params.category : "";
  const offers = params?.offers === "1";

  return (
    <>
      <CategoryFilter
        categories={categories}
        active={category}
        query={q}
        offers={offers}
      />

      {/*
        A second, inner boundary. The chips above paint as soon as the params
        are known, while the grid below still waits on the catalogue query —
        so the filter controls are never held hostage by the data.
      */}
      <Suspense fallback={<MedicineSkeleton />}>
        {/*
          The shell renders immediately; <MedicineList> awaits its data and
          streams in. FilterShell is a Client Component but its `children` are
          server output, so none of the list's code enters the browser bundle.
        */}
        <FilterShell label="medicines">
          <MedicineList q={q} category={category} offers={offers} />
        </FilterShell>
      </Suspense>
    </>
  );
}

/** Static placeholder shown while the params resolve. */
function CatalogueFallback() {
  return (
    <>
      <nav className="filters" aria-label="Filter by category" aria-busy="true">
        {[64, 92, 78, 104, 88].map((width, index) => (
          <span
            key={index}
            className="chip"
            style={{ width, opacity: 0.5 }}
            aria-hidden="true"
          >
            &nbsp;
          </span>
        ))}
      </nav>

      <MedicineSkeleton />
    </>
  );
}
