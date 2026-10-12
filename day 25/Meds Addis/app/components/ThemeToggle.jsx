"use client";

import { useSyncExternalStore } from "react";

import Icon from "./Icon";

/**
 * Light / dark switch.
 *
 * The theme lives outside React. It is decided by three things this component
 * does not own: the OS preference, a value in localStorage, and the
 * `data-theme` attribute that the inline boot script in the root layout writes
 * onto <html> before the first paint. A `useState` copy of it has to be pushed
 * into sync from an effect on mount, which is both a redundant second source of
 * truth and a synchronous `setState` inside an effect — the pattern the
 * `react-hooks/set-state-in-effect` rule exists to catch.
 *
 * `useSyncExternalStore` is the API for exactly this shape of problem. It reads
 * the real source on every render, subscribes to the two things that can change
 * it, and — crucially — takes a separate `getServerSnapshot`, which is what
 * keeps server markup and the hydration pass in agreement. `null` means "not
 * known yet", and it is rendered as the neutral moon icon.
 *
 * The page still never flashes the wrong theme, because the boot script has
 * already written `data-theme` before the first paint. This component only has
 * to agree with it, not establish it.
 */

const THEME_EVENT = "meds-addis:theme";

function subscribe(onStoreChange) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");

  window.addEventListener(THEME_EVENT, onStoreChange);
  query.addEventListener("change", onStoreChange);

  return () => {
    window.removeEventListener(THEME_EVENT, onStoreChange);
    query.removeEventListener("change", onStoreChange);
  };
}

function readIsDark() {
  const attr = document.documentElement.dataset.theme;
  if (attr === "dark") return true;
  if (attr === "light") return false;

  // No explicit choice has been made, so the OS preference is the answer.
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// The server cannot know the preference, so it renders the unresolved state.
// Returning a constant here is what makes the hydration pass match.
const readServerIsDark = () => null;

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, readIsDark, readServerIsDark);

  function toggle() {
    // Read the DOM rather than the `isDark` binding: the attribute is the
    // source of truth, and `isDark` is null until hydration, so `!isDark` would
    // wrongly resolve to "dark" on a first click before hydration completes.
    const next = !readIsDark();

    document.documentElement.dataset.theme = next ? "dark" : "light";

    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // A preference that cannot be persisted is not worth an error boundary.
      // The theme still applies for this page view.
    }

    // Tell useSyncExternalStore to re-read, since the attribute it watches was
    // just changed by this component rather than by the OS.
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      // The label describes the action, not the state — which is what a screen
      // reader user needs to hear before activating it. It stays constant until
      // the preference is known so the server and client agree.
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
