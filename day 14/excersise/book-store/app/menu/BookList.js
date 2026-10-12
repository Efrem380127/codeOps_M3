async function getBooks() {
  return [
    { id: "1", name: "Things Fall Apart" },
    { id: "2", name: "The Shadow King" },
    { id: "3", name: "Beneath the Lion's Gaze" },
  ];
}

export default async function BookList() {
  const books = await getBooks();

  return (
    <div>
      <h2>Available Books</h2>
      <ul>
        {books.map((book) => (
          <li key={book.id}>{book.name}</li>
        ))}
      </ul>
    </div>
  );
}