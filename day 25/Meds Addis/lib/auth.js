/**
 * Meds Addis — password primitives. SERVER ONLY (Node runtime).
 *
 * This module imports `node:crypto`, so it must never be reached from the Edge
 * runtime — which in practice means **middleware must not import it**. Middleware
 * imports `lib/session-token.js` instead, where the HMAC lives and where there is
 * no Node dependency.
 *
 * The split is deliberate:
 *
 *   lib/session-token.js  — edge-safe. Cookie name, token format, HMAC sign and
 *                           verify, safeRedirect. No node:*, no next/headers.
 *   lib/auth.js (here)    — Node-only. Password hashing and verification, which
 *                           genuinely need `node:crypto`.
 *
 * The session helpers are re-exported below so callers that reasonably expect
 * "auth" to own authentication keep working, but the implementation lives in the
 * edge-safe module.
 *
 * Why the cookie is signed rather than storing the raw user id: the cookie is the
 * only thing the browser gets to keep, and an unsigned one is trivially forged.
 * `document.cookie = "meds_session=usr_dawit"` would otherwise hand anyone the
 * manager's dashboard. The HMAC means the value cannot be changed without the
 * server secret.
 */

import { createHash, timingSafeEqual } from "node:crypto";

import { findUserByEmail } from "@/app/data/users";

export {
  signSession,
  readSession,
  safeRedirect,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  SESSION_MAX_AGE_MS,
} from "./session-token";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  // Loud, but not fatal: a missing secret in production is a real problem, and a
  // deployment that refuses to boot on presentation day is a worse one.
  console.warn(
    "[meds-addis] SESSION_SECRET is not set — the session HMAC is using a public default. Set it in the deployment environment.",
  );
}

/* -------------------------------------------------------------------------- */
/* Passwords                                                                  */
/* -------------------------------------------------------------------------- */

/** SHA-256 digest of a password, as lowercase hex. */
export function hashPassword(plain) {
  return createHash("sha256").update(String(plain), "utf8").digest("hex");
}

/**
 * Compare a submitted password to a stored digest.
 *
 * Uses timingSafeEqual so the comparison does not leak the digest one byte at a
 * time. The length guard is required because timingSafeEqual throws on mismatched
 * buffer lengths — and a length check leaks only the digest length, which is a
 * constant here.
 */
export function verifyPassword(plain, storedHash) {
  const submitted = Buffer.from(hashPassword(plain), "hex");
  const stored = Buffer.from(String(storedHash ?? ""), "hex");

  if (submitted.length !== stored.length || stored.length === 0) return false;

  return timingSafeEqual(submitted, stored);
}

/**
 * Look up an account and check its password.
 * Returns the user, or null. Deliberately does not say which half failed, so the
 * response cannot be used to enumerate email addresses.
 */
export function authenticate(email, password) {
  const user = findUserByEmail(email);

  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  return user;
}
