import Image from "next/image";
import Link from "next/link";

import AddToCartButton from "./AddToCartButton";
import StockBadge, { PrescriptionBadge } from "./StockBadge";
import { price } from "@/lib/format";

/**
 * Catalogue card.
 *
 * A Server Component — no directive at the top — which is the point: the card
 * markup, the price formatting and the image all render on the server and ship
 * no JavaScript. The only interactive part, <AddToCartButton>, is a Client
 * Component and is the only thing in this subtree that reaches the browser.
 *
 * The image uses explicit width/height and a `sizes` hint so the browser
 * reserves the correct box before the bytes arrive (that is what keeps CLS at
 * zero) and never downloads a desktop-sized file for a phone.
 */
export default function MedicineCard({ medicine }) {
  return (
    <article className="med-card">
      <div className="med-card__media">
        <Image
          src={medicine.image}
          alt={`${medicine.name} — ${medicine.form}, ${medicine.packSize}`}
          width={400}
          height={300}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
        />

        <div className="med-card__flags">
          {medicine.requiresPrescription && <PrescriptionBadge compact />}
        </div>
      </div>

      <div className="med-card__body">
        <h3 className="med-card__name">
          <Link href={`/medicines/${medicine.id}`}>{medicine.name}</Link>
        </h3>

        <p className="med-card__generic">
          {medicine.genericName} · {medicine.strength}
        </p>

        <p className="med-card__desc">{medicine.description}</p>

        <div className="cluster">
          <StockBadge stock={medicine.stock} />
          <span className="badge badge--neutral">{medicine.category}</span>
        </div>

        <div className="med-card__foot">
          <span className="price">
            {price(medicine.price)}
            <span className="price__unit"> / {medicine.packSize}</span>
          </span>

          <AddToCartButton medicine={medicine} />
        </div>
      </div>
    </article>
  );
}
