import Link from "next/link";

import FoodCard from "@/app/components/FoodCard";
import Icon from "@/app/components/Icon";
import DishSearch from "./DishSearch";
import { categories, dishes } from "@/app/data/dishes";
import { filterDishes } from "@/app/lib/cart";

export const metadata = {
  title: "Menu & Specialties",
  description:
    "Explore our authentic Ethiopian menu featuring freshly prepared wat stews, grilled tibs, and vegan platters.",
  alternates: { canonical: "/menu" }
};

/**
 * The menu.
 *
 * Two sections, two different mechanisms, and the difference is the point:
 *
 *   01  the menu itself — a kitchen-section filter held in the URL and applied
 *       on the server, so a filtered menu is shareable, bookmarkable, works
 *       with the back button, and costs no JavaScript
 *   02  a live keyword search that queries the route handler as you type
 *
 * The page used to be worse than it looked. It carried *three* mutually
 * inconsistent category lists — one in CategoryBar (All, Traditional,
 * Vegetarian, Beverages, as buttons with no handler), one in the menu layout
 * (Traditional Meat, Fasting & Veg, Tej & Beverages, linking to
 * `?category=meat`, `?category=fasting`, `?category=drinks`), and one in the
 * data itself (Main, Vegan, Grill). Nothing read `?category` at all, so every
 * one of those links changed the URL and nothing else. There is now one list,
 * derived from the dishes.
 */
export default async function Menu({ searchParams }) {
  const params = await searchParams;
  const category = typeof params?.category === "string" ? params.category : "";

  // filterDishes matches on a lowercased category and searches the name, the
  // summary and the ingredient list. Passing "" means "every section".
  const visible = filterDishes(dishes, category || "all", "");
  const activeSection = categories.find((name) => name === category) ?? "";

  return (
    <>
      <div className="section-head">
        <div>
          <span className="eyebrow">Cooked to order</span>
          <h1>Menu</h1>
          <span className="script">Everything we cook</span>
          <p className="lede mt-2">
            {dishes.length} dishes across {categories.length} kitchen sections:
            slow-simmered wats, grilled tibs and vegan platters, priced in birr.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="split">
          <div className="split__aside">
            <span className="section-index">01 &middot; Sections</span>
            <h2>Filter the menu</h2>
            <p className="small muted mt-2">
              The filter lives in the address bar, so a filtered menu can be
              sent to someone else and will open the same way.
            </p>
          </div>

          <nav className="filters" aria-label="Filter by kitchen section">
            <Link
              className="chip"
              href="/menu"
              data-active={activeSection === "" ? "true" : "false"}
              aria-current={activeSection === "" ? "true" : undefined}
            >
              All {dishes.length}
            </Link>

            {categories.map((name) => (
              <Link
                key={name}
                className="chip"
                href={`/menu?category=${encodeURIComponent(name)}`}
                data-active={activeSection === name ? "true" : "false"}
                aria-current={activeSection === name ? "true" : undefined}
              >
                {name}
              </Link>
            ))}
          </nav>
        </div>

        {visible.length === 0 ? (
          <div className="state">
            <span className="state__icon" aria-hidden="true">
              <Icon name="search" />
            </span>
            <h3>Nothing in that section</h3>
            <p className="mb-0">
              No dish on the menu belongs to &ldquo;{category}&rdquo;.{" "}
              <Link href="/menu">Show the whole menu</Link>.
            </p>
          </div>
        ) : (
          <div className="menu-grid">
            {visible.map((dish) => (
              <FoodCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-index">02 &middot; Live search</span>
            <h2>Search by name</h2>
          </div>
          <p className="small muted mb-0">
            Fetched from the route handler as you type, so the results update
            without leaving the page.
          </p>
        </div>

        <DishSearch />
      </section>
    </>
  );
}
