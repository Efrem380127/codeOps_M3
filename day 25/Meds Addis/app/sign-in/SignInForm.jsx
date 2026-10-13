"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Sign-in form.
 *
 * A route handler rather than a server action, because signing in has to set a
 * cookie and then send the browser somewhere — and the destination comes back
 * from the server already sanitised by safeRedirect().
 *
 * Three behaviours worth naming:
 *
 *  1. The submit button is disabled while the request is in flight. That is the
 *     double-submit guard: without it, an impatient double-click fires two
 *     sign-in requests and the second can land after a navigation.
 *  2. Errors render in a live region with role="alert", so a screen reader is
 *     told the sign-in failed rather than silently left on the same form.
 *  3. `next` is read from the query string and passed straight back to the
 *     server, which is where the open-redirect check happens. The client does
 *     not attempt to validate it — a check the client can skip is not a check.
 */
export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "That email address and password do not match an account.");
        return;
      }

      /*
       * router.replace, not push: the sign-in page should not be in the history
       * stack behind them, or Back drops them onto a form they already used.
       * refresh() re-renders the server components so the header and any
       * protected page pick up the new session immediately.
       */
      router.replace(data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth__card">
      <Image
        className="auth__mark"
        src="/logo/medaddis-mark.png"
        alt=""
        width={148}
        height={192}
        sizes="56px"
        priority
      />
      <span className="eyebrow">Meds Addis</span>
      <h1>Sign in</h1>
      <p className="lede mt-2 mb-6">
        Sign in to place an order, upload a prescription and follow your
        delivery.
      </p>

      {error && (
        <div className="alert alert--error mb-4" role="alert">
          <div>
            <p className="alert__title">Sign-in failed</p>
            <p className="mb-0">{error}</p>
          </div>
        </div>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            inputMode="email"
            required
            aria-invalid={error ? "true" : undefined}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            aria-invalid={error ? "true" : undefined}
          />
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="demo-accounts">
        <p className="mb-0">
          <strong>Demo accounts</strong> — every one uses the password{" "}
          <code>meds2026</code>. They exist so the dispensary and dashboard can
          be demonstrated; a real deployment would not ship them.
        </p>

        <dl>
          <dt>Customer</dt>
          <dd>abebe@medsaddis.et</dd>

          <dt>Customer</dt>
          <dd>chala@medsaddis.et</dd>

          <dt>Pharmacist</dt>
          <dd>meron@medsaddis.et</dd>

          <dt>Manager</dt>
          <dd>dawit@medsaddis.et</dd>
        </dl>
      </div>

      <p className="small muted mt-6 mb-0">
        Looking for something? <Link href="/medicines">Browse the catalogue</Link>{" "}
        — it does not need an account.
      </p>
    </div>
  );
}
