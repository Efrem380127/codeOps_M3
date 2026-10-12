import Image from "next/image";
import { notFound } from "next/navigation";
import { books } from "@/app/data/books";

export async function generateStaticParams() {
  return books.map((book) => ({ id: String(book.id) }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const book = books.find((d) => String(d.id) === String(id));

  if (!book) {
    return {
      title: "Book Not Found",
      description: "The requested book could not be found.",
    };
  }

  return {
    title: `${book.name} - ${book.price} ETB`,
    description: book.summary,
    openGraph: {
      title: `${book.name} - ${book.price} ETB`,
      description: book.summary,
      images: [
        {
          url: `/menu/${book.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${book.name} at Book Store`,
        },
      ],
    },
  };
}

export default async function BookPage({ params }) {
  const { id } = await params;
  const book = books.find((d) => String(d.id) === String(id));

  if (!book) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: book.name,
    description: book.summary,
    offers: {
      "@type": "Offer",
      price: book.price,
      priceCurrency: "ETB",
    },
    image: book.image,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>{book.name}</h1>
      <p style={{ margin: "0.25rem 0", color: "#b45309", fontWeight: "600", fontSize: "1.25rem" }}>
        {book.price} ETB
      </p>
      <p style={{ margin: "0.5rem 0 1rem", color: "#4b5563" }}>
        {book.summary}
      </p>
      <div style={{ maxWidth: "450px" }}>
        <Image
          src={book.image}
          alt={book.name}
          width={300}
          height={200}
          sizes="(max-width: 640px) 100vw, 450px"
          style={{ width: "100%", height: "auto", borderRadius: "8px" }}
        />
      </div>
    </div>
  );
}