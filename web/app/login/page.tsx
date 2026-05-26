import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/auth";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { user } = await getUserAndProfile();
  const { next } = await searchParams;
  if (user) {
    redirect(next || "/account");
  }
  const nextSafe = next || "/account";

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your PlayFactory account."
      redirectedFrom={next ?? null}
      footer={
        <div className="space-y-3">
          <div className="text-ink-soft">Don't have an account yet?</div>
          <Link
            href={`/signup?next=${encodeURIComponent(nextSafe)}`}
            className="inline-flex w-full justify-center rounded-full border-2 border-primary bg-white px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-soft transition-colors"
          >
            Create new account
          </Link>
        </div>
      }
    >
      <LoginForm next={nextSafe} />
    </AuthShell>
  );
}
