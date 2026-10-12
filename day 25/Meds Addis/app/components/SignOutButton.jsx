"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Sign out.
 *
 * Posts to the sign-out route handler, then refreshes the router so the server
 * components re-render without a session. `router.refresh()` rather than
 * `window.location` because a full reload throws away the client cache for no
 * benefit here — the cookie is already gone, so the refresh is enough.
 */
export default function SignOutButton({ name }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);

    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn--outline btn--sm"
      onClick={handleSignOut}
      disabled={pending}
    >
      {pending ? "Signing out…" : `Sign out${name ? ` (${name.split(" ")[0]})` : ""}`}
    </button>
  );
}
