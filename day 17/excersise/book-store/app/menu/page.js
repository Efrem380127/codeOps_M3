import Link from "next/link";
import { Suspense } from "react";
import CategoryBar from "./CategoryBar";
import BookList from "./BookList";
import BookSearch from "./BookSearch";
import NavigationButton from "./NavigationButton";
import FilterShell from "./FilterShell";

export const revalidate = 60;

export default async function Menu() {
  return (
    <div style={{ padding: "1.5rem" }}>
      <NavigationButton />
      <h1>Menu</h1>

      <nav style={{ margin: "0.5rem 0 1rem" }}>
        <Link href="/">Home</Link>{" | "}
        <Link href="/cart">Cart</Link>{" | "}
        <Link href="/checkout">Checkout</Link>{" | "}
        <Link href="/orders">Orders</Link>
      </nav>

      <Suspense fallback={<p>Loading search...</p>}>
        <BookSearch />
      </Suspense>

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