"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Primary navigation.
 *
 * Client, because of two browser-only needs:
 *   - `usePathname()` to mark the current page with aria-current.
 *   - the mobile disclosure toggle.
 *
 * Accessibility notes that matter here:
 *   - The toggle carries aria-expanded and aria-controls, so the state is
 *     announced rather than only shown.
 *   - Escape closes the panel, which is what a keyboard user expects from a
 *     disclosure.
 *   - On desktop the CSS shows the list unconditionally, so a collapsed state
 *     left over from a mobile visit cannot hide the nav on a wide screen.
 */

/*
 * Public links only. Anything that depends on who is signed in (the dispensary,
 * the manager dashboard) is rendered by <AccountMenu>, which already knows the
 * session — that is what keeps this header out of the way of static rendering.
 */
const LINKS = [
  { href: "/medicines", label: "Medicines" },
  { href: "/prescriptions", label: "Prescriptions" },
  { href: "/orders", label: "My orders" },
];

export default function Navbar() {
  const pathname = usePathname();

  /**
   * The panel is open for a particular path, not open in general.
   *
   * The previous version held a plain boolean and cleared it from an effect
   * watching `pathname`. That is a synchronous `setState` inside an effect —
   * the shape the `react-hooks/set-state-in-effect` rule flags — and it also
   * caused a second render on every navigation: the new page rendered once with
   * the panel still open, then again with it closed.
   *
   * Storing the path the panel was opened at makes `open` a derived value.
   * Navigating changes `pathname`, so `open` becomes false on that render with
   * no effect and no extra pass. Escape and the toggle both work by comparing
   * against the current path.
   */
  const [openPath, setOpenPath] = useState(null);
  const open = openPath !== null && openPath === pathname;

  const panelRef = useRef(null);

  function close() {
    setOpenPath(null);
  }

  function togglePanel() {
    setOpenPath((current) => (current === pathname ? null : pathname));
  }

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") setOpenPath(null);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={togglePanel}
      >
        <span className="nav-toggle__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        {open ? "Close" : "Menu"}
      </button>

      <nav
        id="primary-navigation"
        className="site-nav"
        data-open={open ? "true" : "false"}
        aria-label="Primary"
        ref={panelRef}
      >
        <ul className="site-nav__list">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <li key={link.href}>
                <Link
                  className="site-nav__link"
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  // Close on an explicit tap as well as on navigation. If the
                  // target is the page already open, `pathname` does not change
                  // and the derived value would leave the panel up.
                  onClick={close}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
