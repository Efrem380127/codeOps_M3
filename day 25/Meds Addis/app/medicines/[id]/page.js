import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import AddToCartButton from "@/app/components/AddToCartButton";
import Icon from "@/app/components/Icon";
import EmptyState from "@/app/components/EmptyState";
import StockStatus, { PrescriptionMarker } from "@/app/components/StockStatus";
import { getMedicineById, medicineIds, getReviewsForMedicine } from "@/lib/catalog";
import { price, dateOnly } from "@/lib/format";

/**
 * Rendering strategy: STATIC (SSG).
 *
 * `generateStaticParams` prerenders every medicine at build time, so each
 * detail page is a static HTML document served from the edge. That is the right
 * call here because the catalogue is small, changes rarely, and is identical
 * for everyone — there is nothing per-visitor to render.
 *
 * `generateMetadata` reads the same record, so each page gets its own title,
 * description and OpenGraph image without a second data fetch being obvious to
 * the reader.
 */
export async function generateStaticParams() {
  return medicineIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const medicine = await getMedicineById(id);

  if (!medicine) {
    return {
      title: "Medicine not found",
      description: "That medicine is not in the Meds Addis catalogue.",
    };
  }

  return {
    title: `${medicine.name} — ${medicine.strength}`,
    description: `${medicine.genericName}, ${medicine.packSize}. ${medicine.description}`,
    alternates: { canonical: `/medicines/${medicine.id}` },
    openGraph: {
      title: `${medicine.name} — ${medicine.strength}`,
      description: `${medicine.genericName} · ${medicine.form} · ${price(medicine.price)}`,
      type: "website",
    },
  };
}

export default async function MedicinePage({ params }) {
  const { id } = await params;

  /*
   * Promise.all rather than two sequential awaits: the medicine and its reviews
   * are independent, so fetching them together halves the wait. This is the
   * "promise all" pattern from the reading sheet, applied where it actually
   * pays.
   */
  const [medicine, reviews] = await Promise.all([
    getMedicineById(id),
    getReviewsForMedicine(id),
  ]);

  if (!medicine) {
    notFound();
  }

  const averageRating =
    reviews.length === 0
      ? null
      : reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <main id="main" className="page container">
      <nav className="small muted mb-4" aria-label="Breadcrumb">
        <Link href="/medicines">Medicines</Link>
        {" › "}
        <Link href={`/medicines?category=${encodeURIComponent(medicine.category)}`}>
          {medicine.category}
        </Link>
        {" › "}
        <span>{medicine.name}</span>
      </nav>

      <div className="detail">
        <div className="detail__media">
          <Image
            src={medicine.image}
            alt={`${medicine.name} — ${medicine.form}, ${medicine.packSize}`}
            width={800}
            height={600}
            sizes="(max-width: 900px) 100vw, 520px"
            // Above the fold on this route, so it should not be lazy-loaded.
            priority
          />
        </div>

        <div className="stack">
          <div>
            <div className="cluster mb-4">
              <span className="status status--neutral">{medicine.category}</span>
              <StockStatus stock={medicine.stock} />
              {medicine.requiresPrescription && <PrescriptionMarker />}
            </div>

            <h1>{medicine.name}</h1>
            <p className="lede">
              {medicine.genericName} · {medicine.strength} · {medicine.form}
            </p>
          </div>

          <div className="detail__price">
            <span className="price" style={{ fontSize: "var(--t-2xl)" }}>
              {price(medicine.price)}
            </span>
            <span className="muted small">per {medicine.packSize}</span>
          </div>

          <p>{medicine.description}</p>

          {medicine.requiresPrescription && (
            <div className="alert alert--warn">
              <div>
                <p className="alert__title">
                  <Icon name="capsule" /> Prescription required
                </p>
                <p className="mb-0">
                  A pharmacist must verify a valid prescription before this is
                  dispensed.{" "}
                  <Link href="/prescriptions">Upload one here</Link> — approved
                  prescriptions are reused on later orders.
                </p>
              </div>
            </div>
          )}

          <AddToCartButton medicine={medicine} size="block" />

          <section>
            <h2 className="mb-4">Dosage, storage and cautions</h2>

            <ul className="spec-list">
              <li>
                <span className="spec-list__k">Dosage</span>
                <span>{medicine.dosage}</span>
              </li>
              <li>
                <span className="spec-list__k">Side effects</span>
                <span>{medicine.sideEffects}</span>
              </li>
              <li>
                <span className="spec-list__k">Storage</span>
                <span>{medicine.storage}</span>
              </li>
              <li>
                <span className="spec-list__k">Manufacturer</span>
                <span>{medicine.manufacturer}</span>
              </li>
              <li>
                <span className="spec-list__k">Pack size</span>
                <span>{medicine.packSize}</span>
              </li>
              <li>
                <span className="spec-list__k">Stock on hand</span>
                <span>{medicine.stock} units</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <section className="section mt-6">
        <div className="section-head">
          <div>
            <h2>
              Customer reviews
              {averageRating !== null && (
                <span className="muted small">
                  {" "}
                  · {averageRating.toFixed(1)} out of 5 from {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
              )}
            </h2>
          </div>
        </div>

        {reviews.length === 0 ? (
          <EmptyState icon="info" title="No reviews yet">
            Nobody has reviewed this medicine. Reviews appear here once
            customers who have received an order write one.
          </EmptyState>
        ) : (
          <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
            {reviews.map((review) => (
              <li key={review.id} className="card">
                <div className="between">
                  <strong>{review.author}</strong>
                  <span className="small muted">
                    <span className="rating" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Icon
                          key={n}
                          name={n <= review.rating ? "starFilled" : "star"}
                          className={n <= review.rating ? undefined : "rating__empty"}
                        />
                      ))}
                    </span>{" "}
                    <span className="visually-hidden">
                      {review.rating} out of 5
                    </span>
                    {" · "}
                    {dateOnly.format(new Date(review.date))}
                  </span>
                </div>
                <p className="mb-0 mt-2">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
