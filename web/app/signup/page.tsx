"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";
import { createClient } from "@/lib/supabase/browser";

function SignupContent() {
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
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
            : undefined,
      },
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // The trigger seeds the profile from raw_user_meta_data, but we also
    // upsert here as a safety net (in case the trigger gets skipped or the
    // update runs faster than the auth state is established).
    if (data.user) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email,
          name: name.trim(),
          phone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    if (!data.session) {
      // Email confirmation required
      setLoading(false);
      setSuccess(true);
      return;
    }

    // Full page navigation forces the browser to send the freshly-written
    // auth cookie on the next request. router.replace would race with the
    // cookie write and could land on /book before the proxy sees a session.
    window.location.assign(next);
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

  const cameFromRedirect = !!params.get("next");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Takes 30 seconds. You'll only need to do this once."
      redirectedFrom={cameFromRedirect ? next : null}
      footer={
        <div className="space-y-3">
          <div className="text-ink-soft">Already have an account?</div>
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="inline-flex w-full justify-center rounded-full border-2 border-primary bg-white px-5 py-3 text-sm font-semibold text-primary-dark hover:bg-primary-soft transition-colors"
          >
            Sign in
          </Link>
        </div>
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
          <PasswordInput
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            placeholder="At least 6 characters"
            autoComplete="new-password"
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
