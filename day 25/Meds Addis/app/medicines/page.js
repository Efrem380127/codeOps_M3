import { Suspense } from "react";

import CategoryFilter from "@/app/components/CategoryFilter";
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
      {/* --- Page header ---------------------------------------------------
          Deliberately lighter than a .section-head, because this is a page
          title rather than a section title. Three things came off it:

            - the "Catalogue" eyebrow, which repeated what the h1 and the
              category nav already say;
            - a two-line lede, now one sentence at the quieter 13px step;
            - the results disclosure ("Hide medicines / Results below"), which
              hid content that was already on screen — see the note below.

          The band is three lines instead of five, so the grid starts higher. */}

      <header className="catalogue-head">
        <h1>Medicines</h1>
        <p className="catalogue-head__note">
          Sixteen lines across nine categories. Prescription-only items are
          checked by a pharmacist before dispatch.
        </p>
      </header>

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
        An inner boundary. The chips above paint as soon as the params are
        known, while the grid below still waits on the catalogue query — so the
        filter controls are never held hostage by the data.

        A `FilterShell` Client Component used to wrap the list here, so a button
        could hide and show it. It was removed because it hid content that was
        already on screen: the results sit directly below the chips, so the
        control cost a band of vertical space and bought nothing. The
        composition rule it demonstrated still holds — app/providers.jsx is the
        worked example now, and BOUNDARY.md points there.
      */}
      <Suspense fallback={<MedicineSkeleton />}>
        <MedicineList q={q} category={category} offers={offers} />
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
