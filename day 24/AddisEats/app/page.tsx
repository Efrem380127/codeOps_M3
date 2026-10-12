import Link from "next/link";

import FeaturedDishes from "./components/FeaturedDishes";
import Icon from "./components/Icon";
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
        <div className="hero__inner">
          <div className="stack">
            <span className="eyebrow">Addis Ababa &middot; Cooked to order</span>

            <h1>Ethiopian food, cooked when you order it.</h1>

            <p>
              Slow-simmered wats, grilled tibs and vegan platters from a kitchen
              in Addis Ababa — delivered to your door, with the courier&rsquo;s
              position on a live map while it is on its way.
            </p>

            <div className="hero__actions">
              <Link className="btn btn-primary" href="/menu">
                Browse the menu
              </Link>
              <Link className="btn btn-secondary" href="/order-status">
                Track an order
              </Link>
            </div>
          </div>

          {/*
            A specification strip, not the 2x2 grid of rounded stat tiles this
            slot would usually hold. Values over mono labels, divided by
            hairlines, reading left to right like the panel on a delivery note.
            The counts are read from the menu rather than typed in, so they
            cannot drift out of date.
          */}
          <ul className="hero__facts">
            <li>
              <strong>{dishes.length}</strong>
              <span>Dishes on the menu</span>
            </li>
            <li>
              <strong>{categories.length}</strong>
              <span>Kitchen sections</span>
            </li>
            <li>
              <strong>Same day</strong>
              <span>Across Addis Ababa</span>
            </li>
            <li>
              <strong>
                <Icon name="pin" />
              </strong>
              <span>Live courier tracking</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="split">
          <div className="split__aside">
            <span className="section-index">01 &mdash; Browse</span>
            <h2>What are you hungry for?</h2>
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
            <span className="section-index">02 &mdash; From the kitchen</span>
            <h2>Four to start with</h2>
          </div>
          <p className="small muted mb-0">
            One from each kitchen section, then the next in line — so the first
            thing you see is the range of the menu rather than its first four
            rows.
          </p>
        </div>

        <FeaturedDishes limit={4} />
      </section>

      <section className="section">
        <div className="split">
          <div className="split__aside">
            <span className="section-index">03 &mdash; How it works</span>
            <h2>From order to doorstep</h2>
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
        <div className="rule-block">
          <span className="section-index">04 &mdash; Staff</span>
          <h2>Running the kitchen?</h2>
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
