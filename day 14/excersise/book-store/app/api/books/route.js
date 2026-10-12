import { books } from "../../data/books";

export async function GET() {
  return Response.json(books);
}
