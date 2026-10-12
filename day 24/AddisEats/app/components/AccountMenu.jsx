"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import fetcher from "@/lib/fetcher";
import Icon from "./Icon";

/**
 * Account state in the header.
 *
 * Why this is a client component fetching `/api/auth/session` rather than a
 * server component calling `getSession()`:
 *
 *   Reading cookies() in the root layout marks every route dynamic. `/menu`
 *   declares `revalidate = 60` and is meant to be served from the ISR cache;
 *   a cookie read in the layout would silently take that away. So the session
 *   check is moved off the server render path and onto one small request that
 *   SWR caches for the session.
 *
 * The trade-off is stated plainly: one extra request per visit, in exchange for
 * a statically rendered menu.
 *
 * There is no `fallbackData`. Rendering "Sign in" before the answer arrives
 * would flash the wrong state at every signed-in visitor, so the slot is
 * reserved with a placeholder of the same height instead.
 */

export default function AccountMenu() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const { data, isLoading, mutate } = useSWR("/api/auth/session", fetcher, {
    revalidateOnFocus: true
  });

  const user = data?.user ?? null;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      // Drop the cached session first so the header cannot render a stale user,
      // then refresh so server components re-render without one.
      await mutate({ user: null }, { revalidate: false });
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (isLoading && !data) {
    // Reserved space, not a spinner: a spinner here would shift the nav every
    // time it appeared.
    return (
      <span className="account__who" aria-hidden="true">
        &hellip;
      </span>
    );
  }

  if (!user) {
    return (
      <Link className="btn btn-secondary btn-sm" href="/sign-in">
        Sign in
      </Link>
    );
  }

  return (
    <span className="account">
      <span className="account__who" title={user.name}>
        <Icon name="user" />
        {user.name}
      </span>

      <button
        type="button"
        className="account__out"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? "Signing out\u2026" : "Sign out"}
      </button>
    </span>
  );
}
