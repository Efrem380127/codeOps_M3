import { Suspense } from "react";
import Link from "next/link";

import FeaturedMedicines from "@/app/components/FeaturedMedicines";
import MedicineSkeleton from "@/app/components/MedicineSkeleton";
import Icon from "@/app/components/Icon";
import { categories } from "@/lib/catalog";

export const metadata = {
  title: "Meds Addis — Online Pharmacy & Same-Day Delivery",
  description:
    "Order genuine medicines online in Addis Ababa. Upload a prescription, have it verified by a registered pharmacist, and track your courier live.",
  alternates: { canonical: "/" },
};

/**
 * Home page — a Server Component with no interactivity of its own.
 *
 * Only the hero and the surrounding copy render synchronously; the featured
 * grid streams in behind a Suspense boundary, so the page's Largest
 * Contentful Paint element (the hero heading) is painted from the very first
 * HTML response and does not wait on the catalogue.
 *
 * The layout deliberately avoids one rhythm repeated four times. Sections 01
 * and 03 use an asymmetric split — heading in a narrow column, content in a
 * wide one. Section 02 is full width, because a product grid earns the room.
 * Section 04 is a single rule-marked block. Four sections, three different
 * shapes.
 */

const STEPS = [
  {
    title: "Search the catalogue",
    body: "Sixteen lines across nine therapeutic categories, with the generic name, strength, pack size and stock level on every entry.",
  },
  {
    title: "Upload a prescription if it is needed",
    body: "Anything marked Rx cannot be dispensed without one. Upload it once and it covers every order it names.",
  },
  {
    title: "A pharmacist checks it",
    body: "A registered pharmacist reviews the prescriber's licence before the order moves. Nothing prescription-only leaves the dispensary unchecked.",
  },
  {
    title: "Track it to the door",
    body: "Once dispensed, your courier's position streams to the tracking page every few seconds until it arrives.",
  },
];

export default function HomePage() {
  return (
    <main id="main" className="page container">
      <section className="hero">
        <div className="hero__inner">
          <div className="stack">
            <span className="eyebrow">Addis Ababa · Same-day delivery</span>

            <h1>Your pharmacy, without the queue.</h1>

            <p>
              Order genuine medicines from a licensed dispensary, have
              prescription-only items checked by a registered pharmacist, and
              watch your courier cross the city in real time.
            </p>

            <div className="hero__actions">
              <Link className="btn btn--primary" href="/medicines">
                Browse medicines
              </Link>
              <Link className="btn btn--outline" href="/prescriptions">
                Upload a prescription
              </Link>
            </div>
          </div>

          {/*
            Was a 2×2 grid of rounded tiles holding four big numbers — the
            hero-stat template, and one of the more reliable tells that a page
            was assembled rather than designed. Now it is a specification strip:
            values over mono labels, divided by hairlines, reading left to right
            like the data panel on a dispensing label.
          */}
          <ul className="hero__facts">
            <li>
              <strong>9</strong>
              <span>Therapeutic categories</span>
            </li>
            <li>
              <strong>Same day</strong>
              <span>Across Addis Ababa</span>
            </li>
            <li>
              <strong>
                <Icon name="shield" />
              </strong>
              <span>Pharmacist verified</span>
            </li>
            <li>
              <strong>Live</strong>
              <span>Courier tracking</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="split">
          <div className="split__aside">
            <span className="section-index">01 — Browse</span>
            <h2>What are you looking for?</h2>
            <p className="small muted mt-2">
              Nine therapeutic categories. Every entry shows its generic name
              and current stock, so nothing is a surprise at checkout.
            </p>
          </div>

          <nav className="filters" aria-label="Browse by category">
            {categories.map((category) => (
              <Link
                key={category}
                className="chip"
                href={`/medicines?category=${encodeURIComponent(category)}`}
              >
                {category}
              </Link>
            ))}
            <Link className="chip" href="/medicines">
              All 16
            </Link>
          </nav>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-index">02 — In stock now</span>
            <h2>Popular this week</h2>
          </div>
          <p className="small muted mb-0">
            Drawn from what is on the shelf today, so nothing here turns out to
            be unavailable at checkout.
          </p>
        </div>

        <Suspense fallback={<MedicineSkeleton count={4} />}>
          <FeaturedMedicines limit={4} />
        </Suspense>
      </section>

      <section className="section">
        <div className="split">
          <div className="split__aside">
            <span className="section-index">03 — Procedure</span>
            <h2>From search to doorstep</h2>
            <p className="small muted mt-2">
              Four steps, one of which exists because the medicine is
              prescription-only.
            </p>
          </div>

          {/*
            Was four identical cards each headed "Step 1", "Step 2" and so on.
            The number is the ordering, so it belongs in the margin as a
            marker — not inside a box that repeats the same shape four times.
          */}
          <ol className="steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="steps__n" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        {/* Amber is meaningful here and nowhere else on this page: this is the
            prescription path. */}
        <div className="rule-block">
          <span className="section-index">04 — Prescriptions</span>
          <h2>Have a prescription to hand?</h2>
          <p className="lede mt-2">
            Upload it and a pharmacist will review it against the prescriber
            register. Approved prescriptions are reused automatically on later
            orders.
          </p>
          <div className="mt-4">
            <Link className="btn btn--primary" href="/prescriptions">
              Upload a prescription
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
