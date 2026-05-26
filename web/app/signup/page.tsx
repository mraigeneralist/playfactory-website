"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/browser";

function SignupContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const phoneValid = /^[6-9]\d{9}$/.test(phone);
  const canSubmit = email && password.length >= 6 && name.trim().length >= 2 && phoneValid;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim(), phone },
      },
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // If email confirmation is OFF in Supabase, we already have a session.
    // Profile row is created by the on_auth_user_created trigger — we update
    // it with the name + phone the customer just typed.
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ name: name.trim(), phone })
        .eq("id", data.user.id);
    }

    setLoading(false);

    if (data.session) {
      router.replace(next);
      router.refresh();
    } else {
      // Email confirmation required
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <AuthShell title="Check your inbox" subtitle="We sent you a confirmation link to finish creating your account.">
        <p className="text-sm text-ink-soft">
          Tap the link in the email we just sent to <strong>{email}</strong>, then sign in.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Takes 30 seconds. You'll only need to do this once."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-primary-dark hover:text-primary">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Arjun Kumar"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Phone (10 digits)</label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-border bg-surface px-3 text-sm font-semibold text-ink-soft">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="9876543210"
              className="flex-1 rounded-r-xl border border-border bg-white px-4 py-3 text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {phone.length > 0 && !phoneValid && (
            <p className="mt-1.5 text-xs text-destructive">Enter a valid 10-digit Indian mobile number.</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <button
          disabled={!canSubmit || loading}
          className="btn-primary w-full rounded-full px-5 py-3 text-sm disabled:opacity-40"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <SignupContent />
    </Suspense>
  );
}
