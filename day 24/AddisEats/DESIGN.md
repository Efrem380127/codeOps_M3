# Addis Eats — Design System (DESIGN.md)

## 1. Visual Theme & Atmosphere

Addis Eats is a food delivery application for traditional Ethiopian cooking in
Addis Ababa. The design is built from produce-market references rather than from
SaaS dashboard conventions: a cream paper ground, deep forest green as the
brand's own voice, lime as the one colour that looks pressable, and orange as
the warmth that keeps the green from reading as clinical.

The direction was chosen after two earlier passes were rejected. "Clinical
Swiss" (zero radius, hairlines, mono data) read as an instrument panel. A warm
berbere-and-saffron pass was appetising but fought the client's teal logo and
read as a single restaurant rather than a delivery brand. The current system is
the third, and the one the client approved.

`.impeccable.md` in the project root is the authority on *why*. This file is the
record of *what*.

### Key Characteristics

- **Typography:** **Archivo** for everything structural, set heavy and
  uppercase in headlines with negative tracking. **Caveat** carries one orange
  script subline under each section heading. **IBM Plex Mono** survives only
  where a number has to line up in a column on a kitchen ticket, never in
  customer-facing copy.
- **The colour separation that carries the palette:** the brand is green, so
  green can no longer mean anything. Semantic "ok" moved to teal (hue 190) so a
  confirmed state does not disappear on a green panel. Orange is a highlight
  only and is never a control.
- **Card geometry:** 20px radius (`--r-lg`), green hairline border, soft
  green-tinted shadow, a 2px lift on hover and a 1.06x photo zoom.
- **No pill badges anywhere.** Dietary notes, categories and order statuses are
  plain typographic text with a colour accent, never a capsule. See the
  Zero-Badge Policy below.
- **Motion:** state transitions plus gentle hover lifts, exponential ease-out.
  Nothing bounces.

### The Zero-Badge Policy (Human vs. AI Design)

One of the clearest signals of a generic AI-generated template is the excessive
use of rounded pill badges, coloured tag chips and status bubbles across every
card and header. In Addis Eats:

- **No pill badges or tag chips allowed.** Every item card is clean.
- Dietary designations are understated typographic notes beside or below the
  dish name, not capsules.
- Order and kitchen statuses are plain text labels with a colour accent
  (e.g. `Preparing`), never a chunky badge wrapper.
- Account roles are parenthetical notation, `(customer)` or `(staff)`.
- **No invented content.** No fabricated ratings, review counts, popularity
  badges or "trending" markers. Every number in the UI is a real count from the
  data layer.

---

## 2. Colour Palette & Roles

All values below are the resolved sRGB of the CSS custom properties, read from
the running app in both themes. The stylesheet is the authority; these are a
record of it. Tokens are declared with `light-dark()` against `color-scheme`, so
one declaration serves both themes.

### Brand Colours

- **Forest Green** — light `#194e33`, dark `#71be93`. `--signal`. The brand
  colour and the primary ink: brand title, `h1`–`h3`, section indices, links.
  Deep enough in light mode to carry cream type; light enough in dark mode to
  stay legible as text on the near-black page.
- **Lime** — light `#bcde57`, dark `#c0e160`. `--accent`. Fills every primary
  control: buttons, the cart pill, the active filter chip, the step markers.
  Always with dark green type on it.
- **Orange** — light `#f0772d`, dark `#fd9149`. `--highlight`. The script
  subline under each section headline, and small emphases. Never a control,
  never body copy.
- **Deep Green** — `#0b3a25` in both themes. `--signal-strong` / `--field`. The
  ground for the hero, the closing band and the footer, and the pressed state of
  a primary button.

### The two fixed pairs

These deliberately do **not** flip between themes, and the reason is the same
for both: the surface under them does not flip either.

| Ink | Fill | Value | Why |
|---|---|---|---|
| `--accent-ink` | `--accent` (lime) | `#084027` both themes | Lime stays light in both themes, so the type on it must stay dark in both. |
| `--on-accent-strong` | `--signal-strong` (deep green) | `#fcf9ea` both themes | Deep green stays deep in both, so the type on it stays cream in both. |

An earlier revision let `--accent-ink` lighten in dark mode, which put light
lime on light lime under every primary button at roughly 1.05:1. Text that sits
on the *page* rather than on lime uses `--signal-ink`, which is the token that
does flip.

### Surfaces & Neutrals

- **Paper** — light `#fcf9eb`, dark `#071009`. `--paper`. The page canvas.
  Cream, not white, in light mode.
- **Surface** — light `#ffffff`, dark `#111b13`. `--surface`. Card bodies.
- **Surface Sunken** — light `#f4f1da`, dark `#030904`. `--surface-sunken`.
  Media wells and inset areas.
- **Ink ramp** — `--ink-0` `#102116` / `#f2f3ea` down to `--ink-4` `#8b998f` /
  `#646459`. Body text sits on `--ink-1` and `--ink-2`; `--ink-3` is the muted
  floor and clears 4.5:1 on paper at 4.82:1.
- **Rules** — `--rule` `#d4dfcb` / `#212f24`, `--rule-strong` `#aabf9f` /
  `#3d5040`. Green hairlines, not grey ones.

### Semantic Colours

- **OK** — light `#007570`, dark `#5fc5be`. `--ok`. **Teal, not green**, so a
  confirmed state reads on a green panel.
- **Danger** — light `#bc2826`, dark `#f9786c`. `--danger`. The one hue the
  brand does not use, and therefore the one that still reads as a problem.

Neither ever appears as the fill of a primary control.

### Contrast

Audited from painted pixels in both themes, 40 pairs, all passing. Body copy
holds a 4.5:1 floor; large type holds 3:1. The tightest pairs are the orange
script on paper (4.74:1) and on the deep green band (4.48:1), both clear of the
floor that large type owes. `--accent-ink` on lime measures 7.74:1 light and
8.00:1 dark.

The audit reads the colours from the running app by token name rather than from
a hardcoded list. An earlier version hardcoded the values, and when
`--accent-ink` changed it kept reporting a pass against the old colour.

---

## 3. Typography Rules

### Font Families

- **Display & UI:** `var(--font-archivo), "Archivo", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- **Script accent:** `var(--font-caveat), "Caveat", "Segoe Script", cursive`
- **Mono:** `var(--font-plex-mono), "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`

All three are self-hosted by `next/font` at build time. Nothing is fetched from
a third party at runtime.

### Typographic Scale

| Token | Size | Use |
|---|---|---|
| `--t-2xs` | 0.75rem | Dense labels, step markers, table keys |
| `--t-xs` | 0.8125rem | Section indices, meta lines |
| `--t-sm` | 0.875rem | Buttons, card descriptions |
| `--t-base` | 1rem | Body |
| `--t-md` | 1.125rem | Lede paragraphs, dish prices |
| `--t-lg` | 1.5rem | Dish names |
| `--t-xl` | 2rem | — |
| `--t-2xl` | 2.75rem | — |
| `--t-display` | `clamp(2.6rem, 1.1rem + 6.2vw, 5.75rem)` | The hero headline only |

Line heights are `--lh-tight: 1.02`, `--lh-head: 1.1`, `--lh-body: 1.55`.

### Heading Treatment

- `h1` and `h2` are `font-weight: 900` and `text-transform: uppercase` with
  negative tracking. The weight does the shouting that a colour field used to.
- `h3` stays sentence case at weight 600. Uppercasing every level flattens the
  hierarchy into a single shout.
- `.script` carries the orange Caveat subline under a heading. It is
  `text-transform: none` and `letter-spacing: 0` so it reads as handwriting
  against the uppercase headline above it.

### Copy Rules

**No em-dashes or en-dashes in user-facing text.** They are an AI tell. Use
commas, full stops, or restructure the sentence. Section indices use `&middot;`,
dish titles use `·`. Code comments are exempt.

---

## 4. Component Patterns

### 1. Header & Navigation

- Sticky bar on `--surface` with a 1px `--rule` bottom border. `position:
  sticky` is why the root uses `overflow-x: clip` and not `hidden`: `hidden`
  creates a scroll container and breaks the pin.
- Left: the client's PNG mark (`public/logo/addis-eats-mark.png`, 30px) plus the
  wordmark. In dark mode the mark sits on a light tile, because its `#02685d`
  ink is only about 2.9:1 on the dark header.
- Right: navigation, the theme toggle, the account menu and the cart pill.
- Primary CTA: the cart pill, lime fill with dark green text.

### 2. Hero

The one full-bleed element in the system.

- A photograph fills the band edge to edge, breaking out of the page container
  with `margin-inline: calc(50% - 50vw)`.
- A green scrim runs across it on a 100deg axis, so type sits on a colour the
  system controls rather than on whatever the photograph is doing.
- The copy column is capped at `40rem`, **never in `ch`**: `ch` resolves against
  the element's own 16px font and silently clamps the column to about 410px,
  which pushes the call to action below the fold.
- Lime disc in the far corner above 960px, dropped below that where it would
  collide with the headline.

### 3. Category Filter Chips

- Real `<Link>` elements, not buttons. The filter lives in the URL, which makes
  a filtered menu shareable, bookmarkable and reachable with the back button.
- Inactive: transparent, `--rule-strong` border, `--ink-1` text.
- Active: solid lime, dark green text. No capsule shape; the chip is a
  `--r-md` rectangle.

### 4. Food Card

- Cream `--surface` body, `--r-lg` radius, 1px `--rule` border, `--shadow-sm`.
- Square media well with a 1.06x photo zoom on hover; the photograph is never
  covered inside a card.
- Dish name at `--t-lg` weight 600; price at `--t-md` weight 700 in
  `--signal`, set in the sans so it aligns without the mono's optical weight.
- Card lifts 2px and the shadow deepens on hover.

### 5. The Closing Band (`.cta-band`)

- Deep green `--field` slab, `--r-lg` radius, cream type. The same ground as the
  hero and the footer, so the page opens and closes on the brand's own colour.
- It is the only filled slab on the page, which is what keeps the sections above
  it reading as a rhythm of different shapes.
- A dark panel inverts every assumption the child rules made about their
  background, so the section index, the script subline, the lede and the outline
  button are each re-stated inside `.cta-band`. Without those overrides the lede
  would be near-black on near-black.

### 6. Steps List (`.steps`)

- An ordered list; the number is the information.
- Each marker is a 36px lime disc with the number centred inside, rather than a
  bare numeral in the margin. Four discs read as four discrete stages at a
  glance, where four numerals in a left column read as four paragraphs.

### 7. Orders & Kitchen Tickets

- Ticket on `--surface` with a `--rule` border.
- Order number in `--font-mono` so the digits align down the column.
- Status as plain text with a colour accent, never a badge. `Preparing` in
  `--highlight-ink`, `Delivered` in `--ok-ink`, `Cancelled` in `--danger-ink`.

---

## 5. Technical Implementation Checklist

- [x] `.impeccable.md` and `DESIGN.md` both registered in the project root.
- [x] Token layer declared with `light-dark()` against `color-scheme`, with
      `[data-theme]` overrides for the explicit toggle. Verified in the
      deployed CSS after Lightning CSS downlevels it.
- [x] Archivo + Caveat + IBM Plex Mono applied and self-hosted via `next/font`.
- [x] Colour palette mapped to Forest Green, Lime, Orange, Cream and the deep
      green field, in both themes.
- [x] Semantic `ok` moved to teal so it stays distinct from the green brand.
- [x] All badge and tag pills removed; statuses are typographic.
- [x] No invented content: no fabricated ratings, reviews or popularity markers.
- [x] No em-dashes or en-dashes in user-facing copy.
- [x] Contrast audited from painted pixels: 18 pairs, both themes, all passing.
- [x] Zero horizontal overflow at 390 / 768 / 1024 / 1440 with the sticky header
      still pinned.
- [x] `eslint app --max-warnings=0` clean; build 27/27 routes; zero console
      errors and zero HTTP >= 400 on the deployed site in both themes.
