/**
 * The menu.
 *
 * Every dish points at a photograph of that dish. It did not always: this file
 * used to send Doro Wat, Shiro and Misir Wat at `shiro.jpg`, and Kitfo, Tibs,
 * Lega Tibs and Gored Gored at `pasta.jpg` — a 2.8 KB flat graphic reading
 * "Addis Pasta", which is not Ethiopian food and was never a photograph of
 * anything. Nine real photographs were sitting unused in `public/dishes` at the
 * same time. The images below are those photographs, renamed to URL-safe
 * lowercase so they resolve on a case-sensitive filesystem.
 *
 * Gored Gored is the one exception: there is no photograph of it in the asset
 * set, so it shares Kitfo's. Both are raw beef preparations, which makes it the
 * closest honest match — better than a placeholder that depicts nothing.
 */
export const dishes = [
  {
    id: 1,
    name: "Doro Wat",
    price: 320,
    category: "Main",
    spicy: true,
    summary: "Slow-simmered tender chicken leg in rich berbere sauce with hard-boiled egg and seasoned butter.",
    image: "/dishes/doro-wat.jpg"
  },
  {
    id: 2,
    name: "Kitfo",
    price: 380,
    category: "Main",
    spicy: true,
    summary: "Minced prime beef gently warmed with spiced clarified butter and mitmita chili powder.",
    image: "/dishes/kitfo.jpg"
  },
  {
    id: 3,
    name: "Shiro",
    price: 180,
    category: "Main",
    spicy: false,
    summary: "Creamy slow-cooked chickpea powder stew infused with garlic, ginger, and Ethiopian herbs.",
    image: "/dishes/shiro.jpg"
  },
  {
    id: 4,
    name: "Misir Wat",
    price: 200,
    category: "Vegan",
    spicy: true,
    summary: "Savory red split lentils simmered in aromatic berbere spices, onions, and garlic.",
    image: "/dishes/misir-wat.jpg"
  },
  {
    id: 5,
    name: "Beyainatu",
    price: 220,
    category: "Vegan",
    spicy: false,
    summary: "Colorful vegetarian platter featuring lentils, greens, split peas, and fresh salad on injera.",
    image: "/dishes/beyainatu.jpg"
  },
  {
    id: 6,
    name: "Gomen",
    price: 160,
    category: "Vegan",
    spicy: false,
    summary: "Tender collard greens braised with sweet onions, garlic, and mild Ethiopian peppers.",
    image: "/dishes/gomen.jpg"
  },
  {
    id: 7,
    name: "Tibs",
    price: 340,
    category: "Grill",
    spicy: false,
    summary: "Sautéed beef cubes seared with rosemary, sweet red onions, and mild jalapeño slices.",
    image: "/dishes/derek-tibs.jpg"
  },
  {
    id: 8,
    name: "Lega Tibs",
    price: 360,
    category: "Grill",
    spicy: false,
    summary: "Delicately grilled tender lamb tossed with fresh herbs, garlic, and clarified butter.",
    image: "/dishes/lega-tibs.jpg"
  },
  {
    id: 9,
    name: "Gored Gored",
    price: 400,
    category: "Grill",
    spicy: true,
    summary: "Cubed raw lean beef seasoned with warm niter kibbeh spiced butter and fiery awaze paste.",
    image: "/dishes/kitfo.jpg"
  }
];

/**
 * Kitchen sections, derived from the dishes rather than typed out separately.
 *
 * The menu used to carry its own hardcoded list — ["All", "Traditional",
 * "Vegetarian", "Beverages"] — which shared no value with any dish in this file
 * and had been wrong since the menu was last rewritten. Deriving the list means
 * a category cannot appear in the filter that no dish belongs to, and a new
 * category cannot be forgotten in the filter. Insertion order follows the menu
 * order, so the sections read Main, Vegan, Grill rather than alphabetically.
 */
export const categories = [...new Set(dishes.map((dish) => dish.category))];
