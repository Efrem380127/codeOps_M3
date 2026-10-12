import { books } from "../../../data/books";

export async function GET(request, { params }) {
  const { id } = await params;
  const book = books.find((d) => String(d.id) === String(id));

  if (!book) {
    return Response.json({ error: "Book not found" }, { status: 404 });
  }

  return Response.json(book);
}
