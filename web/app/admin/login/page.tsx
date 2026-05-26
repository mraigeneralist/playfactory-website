"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.replace(next);
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">P</span>
            <span className="font-heading text-xl font-bold text-primary-deep">{BUSINESS.name}</span>
          </Link>
          <span className="text-xs uppercase tracking-wider text-muted">Admin</span>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft border border-border"
        >
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
            <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6-3a6 6 0 11-11.7 2H3a1 1 0 00-1 1v3a1 1 0 001 1h3v3a1 1 0 001 1h3a1 1 0 001-1v-3h.3A6 6 0 0018 8z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink mb-1">Owner sign-in</h1>
          <p className="text-sm text-ink-soft mb-6">Enter the admin password to access the dashboard.</p>

          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {error && (
            <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            disabled={loading || !password}
            className="btn-primary mt-5 w-full rounded-full px-5 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <LoginContent />
    </Suspense>
  );
}
