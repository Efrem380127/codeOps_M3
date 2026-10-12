import { redirect } from "next/navigation";

import CheckoutForm from "@/app/components/CheckoutForm";
import { getSession } from "@/lib/session";
import { getPrescriptionsForUser } from "@/lib/prescriptions";

/**
 * Checkout.
 *
 * Rendering strategy: DYNAMIC.
 *
 * Reading cookies() makes this route server-rendered per request, which is
 * correct — the page depends on who is asking. It is also the second of the
 * three protection layers: middleware already bounced a signed-out visitor, and
 * this re-checks anyway, because middleware is a convenience and this is the
 * control.
 *
 * The comment above the getSession() call is the one the reading sheet asks
 * for: naming why a route cannot be prerendered.
 */
export const metadata = {
  title: "Checkout",
  description: "Confirm delivery details and place your medicine order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // This route must be dynamic: reading cookies() below makes the response
  // depend on who is asking, so it cannot be prerendered at build time.
  const user = await getSession();

  if (!user) {
    redirect("/sign-in?next=/checkout");
  }

  // Only the caller's own prescriptions — the id is taken from the session.
  const prescriptions = await getPrescriptionsForUser(user.id);

  return (
    <main id="main" className="page container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>Confirm your order</h1>
          <p className="lede mt-2">
            Signed in as <strong>{user.name}</strong>. Delivery details are
            prefilled from your account and can be changed for this order.
          </p>
        </div>
      </div>

      <CheckoutForm
        prescriptions={prescriptions}
        user={{ name: user.name, phone: user.phone, address: user.address }}
      />
    </main>
  );
}
