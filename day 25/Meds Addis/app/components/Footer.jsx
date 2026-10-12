import Link from "next/link";

/** Static footer. No session, no cookies — it renders once at build time. */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
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
