import Image from "next/image";

async function getBooks() {
  return [
    { id: "1", name: "Things Fall Apart", image: "/books/things-fall-apart.jpg" },
    { id: "2", name: "The Shadow King", image: "/books/the-shadow-king.jpg" },
    { id: "3", name: "Beneath the Lion's Gaze", image: "/books/beneath-the-lions-gaze.jpg" },
  ];
}

export default async function BookList() {
  const books = await getBooks();

  return (
    <div>
      <h2>Available Books</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        {books.map((book) => (
          <div key={book.id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
            <Image
              src={book.image}
              alt={book.name}
              width={300}
              height={200}
              sizes="(max-width: 640px) 100vw, 300px"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <div style={{ padding: "0.75rem" }}>
              <p style={{ fontWeight: "600" }}>{book.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}