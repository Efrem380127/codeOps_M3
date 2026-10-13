import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import FeaturedMedicines from "@/app/components/FeaturedMedicines";
import MedicineSkeleton from "@/app/components/MedicineSkeleton";
import Icon from "@/app/components/Icon";
import { categories } from "@/lib/catalog";
import { iconForCategory } from "@/lib/category-icons";

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
 * The blocks follow the reference design: hero, trust strip, category tiles,
 * the product row, then the prescription banner. The footer's feature row lives
 * in <Footer>, so it appears on every page rather than only this one.
 */

const TRUST = [
  {
    icon: "truck",
    title: "Fast delivery",
    body: "Same-day across Addis Ababa, on a courier you can watch move.",
  },
  {
    icon: "check",
    title: "100% genuine",
    body: "Sourced from licensed wholesalers, with batch and expiry recorded.",
  },
  {
    icon: "headset",
    title: "Pharmacist advice",
    body: "Every prescription-only line is checked before it is dispensed.",
  },
  {
    icon: "tag",
    title: "Best offers",
    // "and at checkout" used to end this line, and it was not true: the
    // struck-through original price is rendered by the catalogue card and
    // nowhere else. The 21% is the real maximum in app/data/medicines.js.
    body: "Up to 21% off selected lines, with the original price still shown.",
  },
];

/* Initials rather than photographs. A row of stock faces is the one piece of
   the reference that cannot be reproduced honestly — these are not real
   customers, and pretending otherwise would be worse than having no faces. */
const PATIENTS = ["ST", "AB", "MK", "HG"];

export default function HomePage() {
  return (
    <main id="main" className="page container">
      <section className="hero">
        <div className="hero__inner">
          <div>
            <span className="eyebrow">Addis Ababa · Same-day delivery</span>

            {/* Two-tone: the second line carries the brand colour, which is the
                cheapest way to make a hero feel branded. */}
            <h1 className="mt-2">
              Your health,
              <span className="hero__accent">our priority.</span>
            </h1>

            <p className="hero__lede">
              Order genuine medicines from a licensed dispensary, have
              prescription-only items checked by a registered pharmacist, and
              watch your courier cross the city in real time.
            </p>

            <div className="hero__actions">
              <Link className="btn btn--primary btn--lg" href="/medicines">
                Shop medicines
                <Icon name="arrowRight" />
              </Link>
              <Link className="btn btn--outline btn--lg" href="/prescriptions">
                <Icon name="upload" />
                Upload prescription
              </Link>
            </div>

            <div className="hero__proof">
              <span className="avatars" aria-hidden="true">
                {PATIENTS.map((initials) => (
                  <span key={initials} className="avatar">
                    {initials}
                  </span>
                ))}
              </span>

              <ul className="hero__proof-list">
                <li>
                  <strong>9</strong>
                  <span>Therapeutic categories</span>
                </li>
                <li>
                  <strong>16</strong>
                  <span>Lines in stock</span>
                </li>
                <li>
                  <strong>Same day</strong>
                  <span>Across Addis Ababa</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="hero__visual">
            <Image
              src="/hero/hero-pharmacy.jpg"
              alt="A robotic arm holding a medicine bottle above a lit dispensing platform"
              width={1024}
              height={1024}
              priority
              sizes="(max-width: 959px) 100vw, 46vw"
            />
          </div>
        </div>
      </section>

      <section className="section" aria-label="Why order from Meds Addis">
        <ul className="trust-strip">
          {TRUST.map((item) => (
            <li key={item.title} className="trust-item">
              <span className="trust-item__icon" aria-hidden="true">
                <Icon name={item.icon} />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-index">01 — Shop by category</span>
            <h2>What are you looking for?</h2>
          </div>
          <Link className="section-head__link" href="/medicines">
            View all
            <Icon name="chevronRight" />
          </Link>
        </div>

        <nav className="cat-grid" aria-label="Browse by category">
          {categories.map((category) => (
            <Link
              key={category}
              className="cat-tile"
              href={`/medicines?category=${encodeURIComponent(category)}`}
            >
              <span className="cat-tile__icon" aria-hidden="true">
                <Icon name={iconForCategory(category)} />
              </span>
              <span>{category}</span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-index">02 — Popular products</span>
            <h2>Popular this week</h2>
          </div>
          <Link className="section-head__link" href="/medicines?offers=1">
            View all
            <Icon name="chevronRight" />
          </Link>
        </div>

        <Suspense fallback={<MedicineSkeleton count={4} />}>
          <FeaturedMedicines limit={4} />
        </Suspense>
      </section>

      <section className="section">
        <div className="rx-banner">
          <span className="rx-banner__icon" aria-hidden="true">
            <Icon name="file" />
          </span>

          <div>
            <h2>Upload a prescription, get medicines delivered</h2>
            <p>
              Anything marked Rx cannot be dispensed without one. Upload it once
              and a pharmacist will review it against the prescriber register —
              approved prescriptions are then reused automatically on later
              orders.
            </p>
          </div>

          <div>
            <Link className="btn btn--primary btn--lg" href="/prescriptions">
              <Icon name="upload" />
              Upload now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
