/**
 * Meds Addis — session token primitives. EDGE-SAFE.
 *
 * This module exists because of one constraint: Next.js middleware runs in the
 * Edge runtime, and the Edge runtime has no `node:crypto`. Importing lib/auth.js
 * from middleware therefore emits
 *
 *     A Node.js module is loaded ('node:crypto') which is not supported in the
 *     Edge Runtime.
 *
 * The fix is not to stop verifying in middleware — it is to verify with an API
 * that exists in both runtimes. `crypto.subtle` (Web Crypto) is available in the
 * Edge runtime and in Node 19+, so the SAME implementation serves the middleware,
 * the server components and the route handlers. Nothing is duplicated, and there
 * is no second copy of the format to drift out of step.
 *
 * Consequently: no `node:*` import, no `next/headers` import. Keep it that way —
 * one `node:crypto` line here and the warning comes back.
 *
 * Format:  base64url("<userId>.<issuedAt>") + "." + base64url(HMAC-SHA256)
 */

export const SESSION_COOKIE = "meds_session";

/** Seven days. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

const FALLBACK_SECRET = "meds-addis-insecure-development-secret";

function secret() {
  return process.env.SESSION_SECRET ?? FALLBACK_SECRET;
}

/* -------------------------------------------------------------------------- */
/* base64url — no padding, URL-safe alphabet                                  */
/* -------------------------------------------------------------------------- */

function encodeBase64Url(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const withPadding =
    padded.length % 4 === 0 ? padded : padded + "=".repeat(4 - (padded.length % 4));

  const binary = atob(withPadding);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/* -------------------------------------------------------------------------- */
/* HMAC                                                                       */
/* -------------------------------------------------------------------------- */

let keyPromise = null;

function hmacKey() {
  // Cache the imported key. importKey is the expensive half of every sign and
  // verify, and the secret does not change while the process is alive.
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  }
  return keyPromise;
}

async function sign(encodedPayload) {
  const key = await hmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload),
  );
  return encodeBase64Url(new Uint8Array(signature));
}

/**
 * Constant-time string comparison.
 *
 * Web Crypto has no timingSafeEqual, so this does the same job by hand: every
 * character position is compared and the result accumulated, so the comparison
 * never returns early on the first mismatch. Without this, the signature could be
 * recovered one byte at a time by timing the response.
 */
function constantTimeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/** `base64url(payload).base64url(hmac)` */
export async function signSession(userId, issuedAt = Date.now()) {
  const payload = `${userId}.${issuedAt}`;
  const encoded = encodeBase64Url(new TextEncoder().encode(payload));
  const signature = await sign(encoded);

  return `${encoded}.${signature}`;
}

/**
 * Verify a session token and return its user id, or null.
 *
 * Returns null for anything malformed, tampered with, or older than the maximum
 * age — never throws, so every caller can treat null as "signed out".
 */
export async function readSession(token, maxAgeMs = SESSION_MAX_AGE_MS) {
  if (typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;

  const expected = await sign(encoded);
  if (!constantTimeEqual(signature, expected)) return null;

  let payload;
  try {
    payload = new TextDecoder().decode(decodeBase64Url(encoded));
  } catch {
    return null;
  }

  const separator = payload.lastIndexOf(".");
  if (separator === -1) return null;

  const userId = payload.slice(0, separator);
  const issuedAt = Number(payload.slice(separator + 1));

  if (!userId || !Number.isFinite(issuedAt)) return null;
  if (Date.now() - issuedAt > maxAgeMs) return null;

  return userId;
}

/**
 * Only allow same-origin, path-relative redirects.
 *
 * Rejects `https://evil.example`, protocol-relative `//evil.example`, and the
 * backslash trick `/\evil.example` that some browsers normalise to `//`.
 * This is the check that makes attack 3 fail. It lives here, with no runtime
 * dependencies at all, so it is callable from anywhere.
 */
export function safeRedirect(target, fallback = "/") {
  if (typeof target !== "string" || target.length === 0) return fallback;
  if (!target.startsWith("/")) return fallback;
  if (target.startsWith("//") || target.startsWith("/\\")) return fallback;

  return target;
}
