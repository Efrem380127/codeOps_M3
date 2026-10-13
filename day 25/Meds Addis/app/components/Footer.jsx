import Link from "next/link";

import Icon from "./Icon";

/**
 * Static footer. No session, no cookies — it renders once at build time.
 *
 * The feature row at the top is the reference's closing strip. It lives here
 * rather than on the home page so it appears on every page, which is what makes
 * it reassurance rather than a decoration on the landing page.
 */

const FEATURES = [
  {
    icon: "lock",
    title: "Secure payments",
    body: "Checkout runs over TLS, and card details never reach our servers.",
  },
  {
    icon: "refresh",
    title: "Easy returns",
    body: "Unopened lines can be returned within 7 days of delivery.",
  },
  {
    icon: "clock",
    title: "24/7 support",
    body: "A pharmacist is on call for urgent medication questions.",
  },
  {
    icon: "book",
    title: "Medicine guide",
    body: "Dosage, storage and cautions on every medicine page.",
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <ul className="feature-row">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="feature">
              <span className="feature__icon" aria-hidden="true">
                <Icon name={feature.icon} />
              </span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="site-footer__grid">
          <div>
            <h2>Meds Addis</h2>
            <p className="small">
              Licensed pharmacy and same-day medicine delivery across Addis
              Ababa. Every prescription-only order is checked by a registered
              pharmacist before it leaves the dispensary.
            </p>
          </div>

          <div>
            <h2>Shop</h2>
            <ul>
              <li>
                <Link href="/medicines">All medicines</Link>
              </li>
              <li>
                <Link href="/medicines?category=Antibiotics">Antibiotics</Link>
              </li>
              <li>
                <Link href="/medicines?category=Diabetes%20Care">
                  Diabetes care
                </Link>
              </li>
              <li>
                <Link href="/medicines?offers=1">Offers</Link>
              </li>
              <li>
                <Link href="/prescriptions">Upload a prescription</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2>Account</h2>
            <ul>
              <li>
                <Link href="/orders">My orders</Link>
              </li>
              <li>
                <Link href="/cart">Cart</Link>
              </li>
              <li>
                <Link href="/sign-in">Sign in</Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="site-footer__legal">
          Meds Addis is a coursework project built for the IBT College Canada
          CodeOps · Full Stack programme. It is not a real pharmacy: no medicine
          is dispensed, and no payment is taken. In an emergency, contact a
          hospital or call 907.
        </p>
      </div>
    </footer>
  );
}
