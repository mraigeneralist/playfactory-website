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
      setError(error.message);
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

    // Upsert profile so name + phone are stored even if the DB trigger races.
    if (data.user) {
      try {
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
      } catch {
        // Trigger probably already populated it; safe to ignore.
      }
    }

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
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
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
