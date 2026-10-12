import SignInForm from "./SignInForm";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your Book Store account to manage orders and track dispatch status.",
};

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const nextUrl = params?.next || "";

  return (
    <div style={{ padding: "2rem" }}>
      <SignInForm nextUrl={nextUrl} />
    </div>
  );
}
