import Image from "next/image";
import Link from "next/link";

import FeaturedDishes from "./components/FeaturedDishes";
import { categories, dishes } from "./data/dishes";

export const metadata = {
  // No `title` here on purpose: the root layout's `default` is the full brand
  // string, and setting "Home" would render as "Home | Addis Eats" — a weaker
  // result for the page that carries the site's primary search presence.
  description:
    "Order freshly cooked authentic Ethiopian dishes and stews in Addis Ababa, with live courier tracking to your door."
};

/**
 * Home page.
 *
 * The previous version of this file was a bare `<h1>`, a photograph, a rounded
 * panel showing the session, and six links with identical inline styles. Every
 * one of those is a tell that a page was assembled rather than designed — most
 * of all the six identical links, which repeated the header's navigation a
 * second time in a heavier visual weight.
 *
 * It is now four sections in three different shapes, which is the point:
 *
 *   01  an asymmetric split — heading in a narrow column, content in a wide one
 *   02  full width, because a grid of dishes earns the room
 *   03  the same split again, but carrying an ordered list
 *   04  a single rule-marked block
 *
 * A repeated rhythm is what makes a page feel machine-generated, so no two
 * consecutive sections here are built the same way.
 *
 * The account panel is gone from this page entirely. It lives in the header now
 * (app/components/AccountMenu.jsx), which is where identity belongs and where
 * it is reachable from every route rather than only from here.
 */

const STEPS = [
  {
    title: "Pick your dishes",
    body: `Nine dishes across ${categories.length} kitchen sections. Quantities are capped at 20 per dish, so a double-tap on a slow connection cannot order the same plate twice.`
  },
  {
    title: "Check out in one form",
    body: "Your name, the delivery address and a phone number the courier can call. Nothing else is asked for, because nothing else is used."
  },
  {
    title: "The kitchen cooks it",
    body: "Orders reach the kitchen in the order they arrive. Nothing is cooked before you order it, which is why the food is hot when it gets to you."
  },
  {
    title: "Follow it to your door",
    body: "Once a courier is assigned, their position streams to the status page every few seconds until the order is delivered."
  }
];

export default function Home() {
  return (
    <>
      <section className="hero">
        {/*
          A full-bleed photograph with a green scrim over it, so the type sits
          on a colour the system controls rather than on whatever the
          photograph happens to be doing underneath. `fill` needs the section to
          be positioned, which it is.
        */}
        <Image
          src="/hero/hero.png"
          alt=""
          fill
          sizes="100vw"
          className="hero__bg"
          priority
        />
        <div className="hero__scrim" aria-hidden="true" />

        <div className="hero__inner">
          <span className="hero__badge" aria-hidden="true">
            Cooked to order
          </span>

          <div className="hero__copy">
            <span className="script hero__script">Fresh from the kitchen</span>

            <h1>Ethiopian food, cooked when you order it.</h1>

            <p>
              Slow-simmered wats, grilled tibs and vegan platters from a kitchen
              in Addis Ababa, delivered to your door with the courier&rsquo;s
              position on a live map while it is on its way.
            </p>

            <div className="hero__actions">
              <Link className="btn btn-primary" href="/menu">
                Order now
              </Link>
              <Link className="btn btn-secondary" href="/menu">
                View the menu
              </Link>
            </div>

            {/*
              The four-cell stat strip is gone. The same facts now read as one
              line under the buttons, which is where a visitor looks next.
            */}
            <ul className="hero__trust">
              <li>
                <strong>{dishes.length}</strong> dishes
              </li>
              <li>
                <strong>{categories.length}</strong> kitchen sections
              </li>
              <li>Same day across Addis Ababa</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="split">
          <div className="split__aside">
            <span className="section-index">01 &middot; Browse</span>
            <h2>What are you hungry for?</h2>
            <span className="script">Pick a kitchen</span>
            <p className="small muted mt-2">
              {categories.length} kitchen sections. Every dish shows its price up
              front, so nothing is a surprise at checkout.
            </p>
          </div>

          {/*
            Real links, not buttons. The filter lives in the URL, which is what
            makes a filtered menu shareable, bookmarkable, and reachable with
            the back button. The old version of this control was a row of
            <button> elements with no handler at all.
          */}
          <nav className="filters" aria-label="Browse by kitchen section">
            {categories.map((category) => (
              <Link
                key={category}
                className="chip"
                href={`/menu?category=${encodeURIComponent(category)}`}
              >
                {category}
              </Link>
            ))}
            <Link className="chip" href="/menu">
              All {dishes.length}
            </Link>
          </nav>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-index">02 &middot; From the kitchen</span>
            <h2>Four to start with</h2>
            <span className="script">Straight from the pot</span>
          </div>
          <p className="small muted mb-0">
            One from each kitchen section, then the next in line, so the first
            thing you see is the range of the menu rather than its first four
            rows.
          </p>
        </div>

        <FeaturedDishes limit={4} />
      </section>

      <section className="section">
        <div className="split">
          <div className="split__aside">
            <span className="section-index">03 &middot; How it works</span>
            <h2>From order to doorstep</h2>
            <span className="script">Four simple steps</span>
            <p className="small muted mt-2">
              Four steps, one of which you can watch happen in real time.
            </p>
          </div>

          {/*
            The step number is the ordering, so it belongs in the margin as a
            marker — not repeated inside four boxes that are otherwise the same
            shape.
          */}
          <ol className="steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="steps__n" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="cta-band">
          <span className="section-index">04 &middot; Staff</span>
          <h2>Running the kitchen?</h2>
          <span className="script">For the staff</span>
          <p className="lede mt-2">
            The kitchen view lists every order that has been placed, oldest
            first, and moves it through preparing, on the way and delivered.
            It is the same order record the customer sees on the status page.
          </p>
          <div className="mt-4">
            <Link className="btn btn-secondary" href="/kitchen">
              Open the kitchen view
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
