/**
 * Meds Addis — session access. SERVER ONLY.
 *
 * Reading `cookies()` is what makes every route that calls this dynamic: the
 * response depends on who is asking, so it cannot be prerendered at build time.
 * That is intentional for the account, dispensary and dashboard routes — and
 * the reason those routes are listed as ƒ in the build output.
 */

import { cookies } from "next/headers";
import { readSession } from "./session-token";
import { findUserById, isStaff, ROLES } from "@/app/data/users";

/*
 * Re-exported so existing imports of `@/lib/session` keep working. The values
 * themselves live in lib/session-token.js, which is the module middleware can
 * safely import — this file reads next/headers and must stay out of the Edge
 * runtime.
 */
export { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./session-token";

import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./session-token";

/**
 * The cookie flags, in one place so the sign-in route and the sign-out route
 * cannot drift apart.
 *
 *  httpOnly  — JavaScript cannot read it, so an XSS bug cannot exfiltrate the
 *              session.
 *  secure    — HTTPS only, so it is never sent in clear text.
 *  sameSite  — "lax" blocks the cross-site POST half of CSRF while still
 *              allowing a top-level navigation back into the app.
 *  path "/"  — valid across the whole application.
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * The current user, or null.
 *
 * Verifies the signature before trusting the payload, so a hand-edited cookie
 * resolves to "signed out" rather than to someone else's account.
 */
export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const userId = await readSession(token);
  if (!userId) return null;

  return findUserById(userId);
}

/** True when the current visitor is a pharmacist or a manager. */
export async function getStaffSession() {
  const user = await getSession();
  return isStaff(user) ? user : null;
}

/** True only for pharmacists — the people who may verify a prescription. */
export async function getPharmacistSession() {
  const user = await getSession();
  return user?.role === ROLES.PHARMACIST ? user : null;
}
