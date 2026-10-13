import Image from "next/image";
import Link from "next/link";

import AddToCartButton from "./AddToCartButton";
import StockStatus, { PrescriptionMarker } from "./StockStatus";
import { discount } from "@/lib/catalog";
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
 *
 * Nothing sits on the photograph any more. The card used to carry up to four
 * capsules — discount, Rx, stock level and category — two of which floated over
 * the product image. The discount is now carried by the struck-through original
 * price alone, stock and Rx are plain text under the description, and the
 * category moved into the meta line beside the generic name.
 *
 * The struck-through original price comes from `discount()`, which returns null
 * when there is no genuine markdown — so a card never prints a "was" figure
 * that is not actually higher than the price beside it.
 */
export default function MedicineCard({ medicine }) {
  const deal = discount(medicine);

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
      </div>

      <div className="med-card__body">
        <h3 className="med-card__name">
          <Link href={`/medicines/${medicine.id}`}>{medicine.name}</Link>
        </h3>

        <p className="med-card__generic">
          {medicine.genericName} · {medicine.strength} · {medicine.category}
        </p>

        <p className="med-card__desc">{medicine.description}</p>

        <div className="cluster">
          <StockStatus stock={medicine.stock} />
          {medicine.requiresPrescription && <PrescriptionMarker compact />}
        </div>

        <div className="med-card__foot">
          <span className="price">
            {price(medicine.price)}
            {deal && <span className="price__was">{price(deal.was)}</span>}
            <span className="price__unit"> / {medicine.packSize}</span>
          </span>

          <AddToCartButton medicine={medicine} variant="round" />
        </div>
      </div>
    </article>
  );
}
