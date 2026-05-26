import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/supabase/auth";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";

export default async function SignupPage({
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
      title="Create your account"
      subtitle="Takes 30 seconds. You'll only need to do this once."
      redirectedFrom={next ?? null}
      footer={
        <div className="space-y-3">
          <div className="text-ink-soft">Already have an account?</div>
          <Link
            href={`/login?next=${encodeURIComponent(nextSafe)}`}
            className="inline-flex w-full justify-center rounded-full border-2 border-primary bg-white px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-soft transition-colors"
          >
            Sign in
          </Link>
        </div>
      }
    >
      <SignupForm next={nextSafe} />
    </AuthShell>
  );
}
