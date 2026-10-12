/**
 * Icon set.
 *
 * Hand-drawn rather than pulled from a library, for one reason: consistency of
 * stroke weight. Every glyph here is built on the same 24-unit grid with the
 * same 1.5-unit stroke, square caps and mitre joins. That reads as drafted —
 * which is the point of the Clinical Swiss direction — where a mixed bag of
 * third-party icons would not.
 *
 * These replace the emoji the interface used to carry. Emoji render as a
 * different picture on every operating system, cannot inherit `currentColor`,
 * and sit on a different optical weight to the text around them. They are also
 * one of the loudest signals that a UI was generated rather than designed.
 *
 * This is a Server Component: no "use client", no state, no hooks. It can be
 * rendered from anywhere in the tree.
 *
 * Usage:
 *   <Icon name="cart" />
 *   <Icon name="lock" className="icon--lg" />
 *
 * Icons are decorative by default (`aria-hidden`). When an icon is the only
 * content of a control, label the control — do not try to label the icon.
 */

const ICONS = {
  cart: (
    <>
      <path d="M2.75 4h2.4l2.5 10.6h9.9L20 7H6.2" />
      <path d="M9.4 18.6h.01M16.6 18.6h.01" strokeWidth="2.2" />
    </>
  ),

  package: (
    <>
      <path d="M12 3 3.5 7.2v9.6L12 21l8.5-4.2V7.2z" />
      <path d="M3.5 7.2 12 11.4l8.5-4.2" />
      <path d="M12 11.4V21" />
    </>
  ),

  lock: (
    <>
      <path d="M4.75 10.5h14.5v10H4.75z" />
      <path d="M8.25 10.5V7.4a3.75 3.75 0 0 1 7.5 0v3.1" />
    </>
  ),

  check: <path d="M4.5 12.6 9.8 17.9 19.5 6.6" />,

  close: <path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8" />,

  plus: <path d="M12 4.2v15.6M4.2 12h15.6" />,

  minus: <path d="M4.2 12h15.6" />,

  search: (
    <>
      <circle cx="10.6" cy="10.6" r="6.1" />
      <path d="M15.1 15.1 20 20" />
    </>
  ),

  menu: <path d="M4 7h16M4 12h16M4 17h16" />,

  chevronRight: <path d="M9.5 5.5 16 12l-6.5 6.5" />,

  truck: (
    <>
      <path d="M2.75 6.2h11.4v10.1H2.75z" />
      <path d="M14.15 9.2h3.6l3.5 3.4v3.7h-7.1z" />
      <path d="M7.1 18.5h.01M17.6 18.5h.01" strokeWidth="2.2" />
    </>
  ),

  capsule: (
    <g transform="rotate(-45 12 12)">
      <path d="M3.4 8.6h17.2v6.8H3.4z" />
      <path d="M12 8.6v6.8" />
    </g>
  ),

  alert: (
    <>
      <path d="M12 3.6 21.2 19.4H2.8z" />
      <path d="M12 9.8v4.4" />
      <path d="M12 16.8h.01" strokeWidth="2.2" />
    </>
  ),

  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 6.8v5.4l3.6 2.1" />
    </>
  ),

  user: (
    <>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.9 20.2a7.1 7.1 0 0 1 14.2 0" />
    </>
  ),

  trash: (
    <>
      <path d="M3.8 6.4h16.4" />
      <path d="M9.2 6.4V3.6h5.6v2.8" />
      <path d="M6.4 6.4 7.5 20.4h9l1.1-14" />
    </>
  ),

  download: (
    <>
      <path d="M12 3.6v11.2" />
      <path d="M7.6 10.4 12 14.8l4.4-4.4" />
      <path d="M4 19.8h16" />
    </>
  ),

  upload: (
    <>
      <path d="M12 15.4V4.2" />
      <path d="M7.6 8.6 12 4.2l4.4 4.4" />
      <path d="M4 19.8h16" />
    </>
  ),

  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6" />
      <path d="M5.4 5.4 7.2 7.2M16.8 16.8l1.8 1.8M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8" />
    </>
  ),

  moon: <path d="M20.2 14.6A8.7 8.7 0 0 1 9.4 3.8a8.7 8.7 0 1 0 10.8 10.8z" />,

  file: (
    <>
      <path d="M6.2 3h7.6l4 4v14H6.2z" />
      <path d="M13.8 3v4h4" />
      <path d="M9.4 12.2h5.2M9.4 15.8h3.4" />
    </>
  ),

  shield: (
    <>
      <path d="M12 3 4.6 6v6c0 4.6 3.1 7.9 7.4 9 4.3-1.1 7.4-4.4 7.4-9V6z" />
      <path d="M9.1 12.2 11.3 14.4 15.4 9.7" />
    </>
  ),

  refresh: (
    <>
      <path d="M19.8 12a7.8 7.8 0 1 1-2.2-5.4" />
      <path d="M20 4.2v4h-4" />
    </>
  ),

  filter: <path d="M3.6 5.2h16.8l-6.5 7.6v6.4l-3.8-2v-4.4z" />,

  info: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11.2v5.4" />
      <path d="M12 7.6h.01" strokeWidth="2.2" />
    </>
  ),

  pin: (
    <>
      <path d="M12 20.8s6.4-6 6.4-10.3a6.4 6.4 0 1 0-12.8 0C5.6 14.8 12 20.8 12 20.8z" />
      <circle cx="12" cy="10.4" r="2.4" />
    </>
  ),

  arrowRight: (
    <>
      <path d="M4.4 12h15.2" />
      <path d="M13.8 6.2 19.6 12l-5.8 5.8" />
    </>
  ),

  arrowLeft: (
    <>
      <path d="M19.6 12H4.4" />
      <path d="M10.2 6.2 4.4 12l5.8 5.8" />
    </>
  ),

  sort: (
    <>
      <path d="M12 4.4v15.2" />
      <path d="M7.6 8.8 12 4.4l4.4 4.4" />
    </>
  ),

  // The rating scale. Two glyphs rather than one, because a rating is a filled
  // / unfilled pair and the fill has to be a property of the glyph: the parent
  // <svg> sets fill="none" for the whole outline-based set.
  //
  // These replace the ★ and ☆ dingbats, which are a different shape on every
  // platform for the same reason emoji are.
  star: (
    <path d="M12 2.8 14.29 8.84 20.75 9.16 15.71 13.21 17.41 19.44 12 15.9 6.59 19.44 8.29 13.21 3.25 9.16 9.71 8.84Z" />
  ),

  starFilled: (
    <path
      d="M12 2.8 14.29 8.84 20.75 9.16 15.71 13.21 17.41 19.44 12 15.9 6.59 19.44 8.29 13.21 3.25 9.16 9.71 8.84Z"
      fill="currentColor"
    />
  ),
};

export default function Icon({ name, className = "", ...rest }) {
  const glyph = ICONS[name];

  // Fail loudly in development rather than rendering nothing silently — a
  // missing icon should be noticed at build time, not in production.
  if (!glyph) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        `Icon: unknown name "${name}". Available: ${Object.keys(ICONS).join(", ")}`,
      );
    }
    return null;
  }

  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {glyph}
    </svg>
  );
}
