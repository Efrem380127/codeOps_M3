import Image from "next/image";
import Link from "next/link";
import { books } from "@/app/data/books";

export default async function BookList() {
  return (
    <div>
      <h2>Available Books</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/menu/${book.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
              <Image
                src={book.image}
                alt={book.name}
                width={300}
                height={200}
                sizes="(max-width: 640px) 100vw, 300px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <div style={{ padding: "0.75rem" }}>
                <p style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{book.name}</p>
                <p style={{ color: "#b45309", fontWeight: "600", fontSize: "0.875rem" }}>{book.price} ETB</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}