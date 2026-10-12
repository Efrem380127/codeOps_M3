import FoodCard from "./FoodCard";
import { dishes } from "@/app/data/dishes";

/**
 * Featured dishes for the home page.
 *
 * The selection is a rule, not a hand-picked list, so the home page cannot
 * drift out of sync with the menu: take the first dish from each kitchen
 * section, then fill any remaining slots from what is left. With three
 * sections and a limit of four that yields Doro Wat, Misir Wat, Tibs and
 * Kitfo — a spread across the menu rather than the first four rows of an
 * array, and the same four on every build.
 *
 * There is deliberately no "popular" or "best-selling" framing here. This
 * application records orders, but it does not aggregate them into a ranking,
 * so a "Popular this week" heading would be a claim the data cannot support.
 */
export default function FeaturedDishes({ limit = 4 }) {
  const firstOfEachSection = [];
  const coveredSections = new Set();

  for (const dish of dishes) {
    if (coveredSections.has(dish.category)) continue;
    coveredSections.add(dish.category);
    firstOfEachSection.push(dish);
  }

  // Match on id, not on `coveredSections` — that set holds category names, so
  // testing it against an id would always miss and re-add the same dish.
  const alreadyPicked = new Set(firstOfEachSection.map((dish) => dish.id));
  const remainder = dishes.filter((dish) => !alreadyPicked.has(dish.id));

  const featured = [...firstOfEachSection, ...remainder].slice(0, limit);

  return (
    <div className="menu-grid">
      {featured.map((dish) => (
        <FoodCard key={dish.id} dish={dish} />
      ))}
    </div>
  );
}
