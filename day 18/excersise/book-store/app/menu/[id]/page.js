import Image from "next/image";
import { notFound } from "next/navigation";

const books = [
  { id: "1", name: "Things Fall Apart", image: "/books/things-fall-apart.jpg" },
  { id: "2", name: "The Shadow King", image: "/books/the-shadow-king.jpg" },
  { id: "3", name: "Beneath the Lion's Gaze", image: "/books/beneath-the-lions-gaze.jpg" },
];

export async function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export default async function BookPage({ params }) {
  const { id } = await params;

  const book = books.find((book) => book.id === id);

  if (!book) {
    notFound();
  }

  return (
    <div>
      <h1>{book.name}</h1>
      <p style={{ margin: "0.5rem 0 1rem" }}>Book ID: {book.id}</p>
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