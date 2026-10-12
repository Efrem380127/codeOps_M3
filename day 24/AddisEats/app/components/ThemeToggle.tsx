"use client";

import { useCallback, useSyncExternalStore } from "react";

import Icon from "./Icon";

/**
 * Light / dark switch.
 *
 * The theme is not React state. It lives in three places outside React — the
 * OS preference, localStorage, and the `data-theme` attribute the boot script
 * in the root layout writes onto <html> before the first paint. So it is read
 * through useSyncExternalStore, which is the supported way to subscribe to an
 * external store and, crucially, lets the server snapshot differ from the
 * client's.
 *
 * The server snapshot is `null`: on the server there is no localStorage and no
 * matchMedia, so the initial value is genuinely unknowable. Rendering one
 * stable state until hydration is what keeps the markup honest. The page still
 * never flashes the wrong theme, because the boot script has already set
 * `data-theme` before paint — this component only has to agree with it.
 *
 * Subscribing to matchMedia rather than reading it once also means the icon
 * updates if the user changes their OS theme while the page is open, which the
 * previous effect-based version did not do.
 */

// Dispatched after a manual toggle so the subscription re-reads the DOM.
// Named for this app: an earlier pass had carried over the sibling project's
// event name verbatim, which is the kind of detail that only shows up when the
// two codebases are read side by side.
const THEME_EVENT = "addis-eats:theme";

function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(THEME_EVENT, onStoreChange);
  query.addEventListener("change", onStoreChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onStoreChange);
    query.removeEventListener("change", onStoreChange);
  };
}

/**
 * The DOM attribute is the source of truth, because the boot script writes it
 * before React exists. Only when it is absent — a browser that blocked the
 * script — does the OS preference get consulted.
 */
function readIsDark() {
  const attr = document.documentElement.dataset.theme;
  if (attr === "dark") return true;
  if (attr === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, readIsDark, () => null);

  const toggle = useCallback(() => {
    const next = !readIsDark();
    document.documentElement.dataset.theme = next ? "dark" : "light";

    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage throws in Safari private mode. A preference that cannot be
      // persisted is not worth an error boundary — the theme still applies for
      // this page view.
    }

    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      // The label describes the action, not the state — which is what a screen
      // reader user needs to hear before activating it. It stays constant until
      // hydration so the server and client agree.
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="visually-hidden">
        {isDark === null
          ? "Switch theme"
          : `Switch to ${isDark ? "light" : "dark"} theme`}
      </span>
      <Icon name={isDark === true ? "sun" : "moon"} />
    </button>
  );
}
