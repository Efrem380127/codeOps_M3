import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Welcome to the Book Store</h1>
      <p>Discover your next favorite book.</p>
      <Link href="/menu">Browse the Menu</Link>
    </div>
  );
}
