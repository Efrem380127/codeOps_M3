import { notFound } from "next/navigation";

const books = [
  {
    id: "1",
    name: "Things Fall Apart",
  },
  {
    id: "2",
    name: "The Shadow King",
  },
  {
    id: "3",
    name: "Beneath the Lion's Gaze",
  },
];

export default async function BookPage({ params }) {
  const { id } = await params;

  const book = books.find((book) => book.id === id);

  if (!book) {
    notFound();
  }

  return (
    <div>
      <h1>{book.name}</h1>
      <p>Book ID: {book.id}</p>
    </div>
  );
}