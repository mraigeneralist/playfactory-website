"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import PasswordInput from "@/components/auth/PasswordInput";

export default function LoginForm({ next }: { next: string }) {
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
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // Full page navigation so the server picks up the new session cookie
    // on the next request. Same pattern healthy-food uses.
    window.location.assign(next);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Email</label>
        <input
          type="email"
          required
          autoComplete="email"
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
        type="submit"
        disabled={loading}
        className="btn-primary w-full rounded-full px-5 py-3 text-sm disabled:opacity-40"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
