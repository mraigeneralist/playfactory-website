"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BUSINESS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/browser";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/coaching", label: "Coaching" },
  { href: "/memberships", label: "Memberships" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [initial, setInitial] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const hydrate = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSignedIn(!!session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", session.user.id)
          .maybeSingle();
        const source = profile?.name || session.user.email || "";
        setInitial(source.trim().charAt(0).toUpperCase() || "?");
      } else {
        setInitial("");
      }
    };
    hydrate();

    const { data: sub } = supabase.auth.onAuthStateChange(() => hydrate());
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all ${
        scrolled ? "bg-white/90 backdrop-blur-md border-b border-border shadow-soft" : "bg-transparent"
      }`}
      style={{ height: "var(--nav-h)" }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">P</span>
          <span className="font-heading text-xl font-bold text-primary-deep">{BUSINESS.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-soft hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/book"
            className="btn-primary rounded-full px-5 py-2.5 text-sm"
          >
            Book a Slot
          </Link>
          {signedIn === false ? (
            <Link
              href="/login"
              aria-label="Sign in"
              title="Sign in"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink-soft hover:border-primary hover:text-primary transition-colors"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
          ) : signedIn ? (
            <Link
              href="/account"
              aria-label="My account"
              title="My account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-bold shadow-soft hover:shadow-rich transition-shadow"
            >
              {initial}
            </Link>
          ) : (
            <span className="inline-block h-10 w-10" />
          )}
        </nav>

        <button
          aria-label="Toggle menu"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-white border-b border-border shadow-soft">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink-soft hover:bg-surface hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
            {signedIn === false ? (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-semibold text-primary-dark hover:bg-surface flex items-center gap-2"
              >
                <UserIcon className="h-5 w-5" /> Sign in
              </Link>
            ) : signedIn ? (
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-semibold text-primary-dark hover:bg-surface flex items-center gap-2"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  {initial}
                </span>
                My Account
              </Link>
            ) : null}
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 rounded-full px-5 py-3 text-center text-sm"
            >
              Book a Slot
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
