import Link from "next/link";
import { Suspense } from "react";
import CategoryBar from "./CategoryBar";
import BookList from "./BookList";
import NavigationButton from "./NavigationButton";
import FilterShell from "./FilterShell";

export const revalidate = 60;

export default async function Menu() {
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

      <FilterShell>
        <Suspense fallback={<p>Loading books...</p>}>
          <BookList />
        </Suspense>
      </FilterShell>

      <h2>Book Details</h2>
      <Link href="/menu/1">View Book 1</Link>
    </div>
  );
}