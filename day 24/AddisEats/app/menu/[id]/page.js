import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import AddToCartButton from "@/app/components/AddToCartButton";
import Icon from "@/app/components/Icon";
import { dishes } from "@/app/data/dishes";

export async function generateStaticParams() {
  return dishes.map((dish) => ({ id: String(dish.id) }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = dishes.find((d) => String(d.id) === String(id));

  if (!dish) {
    return {
      title: "Dish not found",
      description: "The requested Ethiopian dish could not be found."
    };
  }

  return {
    // This read `${dish.name} - $${dish.price}` — a dollar sign in front of a
    // price denominated in birr, which is what the visitor saw in the browser
    // tab and in every link preview. It now reads the way the price reads
    // everywhere else in the application.
    title: `${dish.name} · ${dish.price} ETB`,
    description: dish.summary,
    alternates: { canonical: `/menu/${dish.id}` },
    openGraph: {
      title: `${dish.name} · ${dish.price} ETB`,
      description: dish.summary,
      images: [
        {
          url: `/menu/${dish.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${dish.name} at Addis Eats`
        }
      ]
    }
  };
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = dishes.find((d) => String(d.id) === String(id));

  if (!dish) {
    notFound();
  }

  // The other dishes in this kitchen section, so the page is not a dead end for
  // a visitor who arrived from a search result and is not sure what they want.
  const related = dishes.filter(
    (entry) => entry.category === dish.category && entry.id !== dish.id
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.summary,
    offers: {
      "@type": "Offer",
      price: dish.price,
      priceCurrency: "ETB"
    },
    image: dish.image
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/menu">Menu</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{dish.name}</span>
      </nav>

      <div className="split">
        <div className="split__aside">
          <span className="section-index">{dish.category}</span>
          <h1>{dish.name}</h1>

          <p className="price mt-2">
            {dish.price} <span className="price__unit">ETB</span>
          </p>

          <p className="lede mt-2">{dish.summary}</p>

          <ul className="spec-list mt-4">
            <li>
              <span className="spec-list__k">Kitchen section</span>
              <span>{dish.category}</span>
            </li>
            <li>
              <span className="spec-list__k">Heat</span>
              <span>
                {dish.spicy ? (
                  <>
                    <Icon name="flame" style={{ color: "var(--signal)" }} /> Spicy
                  </>
                ) : (
                  "Mild"
                )}
              </span>
            </li>
            <li>
              <span className="spec-list__k">Delivery</span>
              <span>50 ETB, added at checkout</span>
            </li>
          </ul>

          <div className="dish-actions">
            <AddToCartButton dish={dish} />
            <Link className="btn btn-secondary" href="/menu">
              Back to the menu
            </Link>
          </div>
        </div>

        <figure className="dish-figure">
          <Image
            src={dish.image}
            alt={dish.name}
            width={720}
            height={540}
            sizes="(max-width: 900px) 100vw, 60vw"
            priority
          />
        </figure>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <span className="section-index">Also in {dish.category}</span>
              <h2>Other dishes in this section</h2>
            </div>
          </div>

          <nav className="filters" aria-label={`More dishes in ${dish.category}`}>
            {related.map((entry) => (
              <Link key={entry.id} className="chip" href={`/menu/${entry.id}`}>
                {entry.name}
              </Link>
            ))}
            <Link
              className="chip"
              href={`/menu?category=${encodeURIComponent(dish.category)}`}
            >
              All {dish.category}
            </Link>
          </nav>
        </section>
      )}
    </>
  );
}
