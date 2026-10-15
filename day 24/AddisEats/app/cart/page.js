import CartContents from "@/app/components/CartContents";

export const metadata = {
  title: "Shopping Cart",
  description: "Review your selected Ethiopian dishes, adjust quantities, and proceed to checkout."
};

/**
 * The cart.
 *
 * This page used to be a heading and a sentence. `CartContents` existed, fully
 * written, with its own CSS already in the stylesheet, and nothing ever
 * imported it, so the page had no way to show a basket even once the cart
 * provider worked. Mounting it is the whole fix here.
 */
export default function Cart() {
  return (
    <>
      <div className="section-head">
        <div>
          <span className="eyebrow">Your basket</span>
          <h1>Your Cart</h1>
          <span className="script">Ready when you are</span>
          <p className="lede mt-2">
            Review your order, adjust quantities, then continue to checkout.
          </p>
        </div>
      </div>

      <section className="section">
        <CartContents />
      </section>
    </>
  );
}
