import { Suspense } from "react";
import { redirect } from "next/navigation";

import SignInForm from "./SignInForm";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Sign in",
  description:
    "Sign in to order medicines, upload a prescription and track your delivery across Addis Ababa.",
  // A sign-in page has no business in a search index.
  robots: { index: false, follow: false },
};

/**
 * Sign in.
 *
 * Rendering strategy: DYNAMIC, and deliberately so. Reading cookies() below
 * makes this route server-rendered per request — which is exactly right, because
 * the answer depends on who is asking. A signed-in visitor should never see a
 * sign-in form.
 *
 * <SignInForm> is wrapped in Suspense because it calls useSearchParams() to read
 * the `next` parameter. Next requires that boundary: without it the whole route
 * would be forced to client-side render, and the heading would flash.
 */
export default async function SignInPage({ searchParams }) {
  // This route must be dynamic: reading cookies() below makes the response
  // depend on who is asking, so it cannot be prerendered at build time.
  const user = await getSession();

  const { next } = await searchParams;

  if (user) {
    /*
     * Already signed in. Rather than showing a pointless form, send them where
     * they were going — but only after the same relative-path check the sign-in
     * route handler applies, because `next` comes straight off the URL.
     */
    const target =
      typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/";

    redirect(target);
  }

  return (
    <main id="main" className="page container">
      <div className="auth">
        <Suspense
          fallback={
            <div className="auth__card" role="status" aria-busy="true">
              <p className="mb-0">Loading the sign-in form…</p>
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
