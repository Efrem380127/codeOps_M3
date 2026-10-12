import Link from "next/link";
import CategoryBar from "./CategoryBar";
import BookList from "./BookList";
import NavigationButton from "./NavigationButton";

export default function Menu() {
  return (
    <div>
      <NavigationButton />
      <h1>Menu</h1>

      <nav>
        <Link href="/">Home</Link>{" | "}
        <Link href="/cart">Cart</Link>{" | "}
        <Link href="/checkout">Checkout</Link>
      </nav>

      <CategoryBar />

      <BookList />

      <h2>Book Details</h2>
      <Link href="/menu/1">View Book 1</Link>
    </div>
  );
}