"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";
import { createClient } from "@/lib/supabase/browser";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  const cameFromRedirect = !!params.get("next");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your PlayFactory account."
      redirectedFrom={cameFromRedirect ? next : null}
      footer={
        <div className="space-y-3">
          <div className="text-ink-soft">Don't have an account yet?</div>
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="inline-flex w-full justify-center rounded-full border-2 border-primary bg-white px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-soft transition-colors"
          >
            Create new account
          </Link>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Password</label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
          />
        </div>
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <button
          disabled={loading}
          className="btn-primary w-full rounded-full px-5 py-3 text-sm disabled:opacity-40"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <LoginContent />
    </Suspense>
  );
}
