"use client";

import Link from "next/link";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import SignOutButton from "./SignOutButton";

/**
 * Account state in the header.
 *
 * Why this is a client component fetching `/api/auth/session` rather than a
 * server component calling `getSession()`:
 *
 *   Reading cookies() in the root layout marks every route dynamic. This
 *   application wants /medicines to be static and ISR-cached, so the session
 *   check is moved off the server render path entirely.
 *
 * The trade-off is honest: one extra small request per session, in exchange for
 * a statically rendered catalogue. SWR caches the answer, so it is not one
 * request per navigation.
 *
 * `fallbackData` is intentionally absent — showing "Sign in" before we know
 * would flash the wrong state for signed-in users, so the space is reserved
 * with a placeholder instead.
 */

const STAFF_LINKS = [
  { href: "/dispensary", label: "Dispensary", roles: ["pharmacist", "manager"] },
  { href: "/dashboard", label: "Dashboard", roles: ["manager"] },
];

export default function AccountMenu() {
  const { data, isLoading } = useSWR("/api/auth/session", fetcher, {
    revalidateOnFocus: true,
  });

  const user = data?.user ?? null;

  if (isLoading && !data) {
    return (
      <span className="small muted" aria-hidden="true">
        …
      </span>
    );
  }

  if (!user) {
    return (
      <Link className="btn btn--outline btn--sm" href="/sign-in">
        Sign in
      </Link>
    );
  }

  const staffLinks = STAFF_LINKS.filter((link) => link.roles.includes(user.role));

  return (
    <span className="cluster">
      {staffLinks.map((link) => (
        <Link
          key={link.href}
          className="btn btn--ghost btn--sm"
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
      <SignOutButton name={user.name} />
    </span>
  );
}
