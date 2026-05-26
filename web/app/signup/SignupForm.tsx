"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import PasswordInput from "@/components/auth/PasswordInput";

export default function SignupForm({ next }: { next: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmailConfirm, setPendingEmailConfirm] = useState(false);

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
      // Common Supabase error: surface a friendlier message + sign-in offer
      // for already-registered emails.
      const lower = error.message.toLowerCase();
      if (lower.includes("already registered") || lower.includes("user already")) {
        setError("ALREADY_REGISTERED");
      } else {
        setError(error.message);
      }
      return;
    }

    // If email confirmation is OFF in Supabase, a session is created
    // immediately and we hard-navigate (so the server picks up the cookie).
    // If it's ON, no session yet — show a "check inbox" message.
    if (!data.session) {
      setLoading(false);
      setPendingEmailConfirm(true);
      return;
    }

    // No client-side profile upsert. The DB trigger on auth.users (migration
    // 0002) reads name + phone from raw_user_meta_data (which we set via
    // options.data above) and creates a complete profile row. A client-side
    // upsert here used to hang occasionally and freeze the button in
    // "Creating…" — worth dropping for reliability.

    // Hard-navigate so the server sees the freshly-written session cookie.
    window.location.assign(next);
  }

  if (pendingEmailConfirm) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-primary/30 bg-primary-soft p-4 text-sm text-primary-deep">
          <strong>Almost done.</strong> Check your inbox at <b>{email}</b> for a confirmation
          link, then come back here to sign in.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Full name</label>
        <input
          type="text"
          required
          autoComplete="name"
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
            autoComplete="tel-national"
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
          autoComplete="email"
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
      {error === "ALREADY_REGISTERED" ? (
        <div className="rounded-xl border border-primary/30 bg-primary-soft p-3 text-sm text-primary-deep">
          <strong>This email already has an account.</strong>{" "}
          <a
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold underline underline-offset-4 hover:text-primary"
          >
            Sign in instead →
          </a>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="btn-primary w-full rounded-full px-5 py-3 text-sm disabled:opacity-40"
      >
        {loading ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
