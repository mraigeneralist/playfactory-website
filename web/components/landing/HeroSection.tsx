"use client";

import Link from "next/link";
import { useState } from "react";
import { BUSINESS, SPORTS, formatINR } from "@/lib/constants";

export default function HeroSection() {
  const [picked, setPicked] = useState<string>(SPORTS[0].id);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-surface via-white to-surface-2">
      <div className="dot-tex absolute inset-0 opacity-60" />

      {/* Soft color blob */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-bright/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid items-center gap-10 md:gap-12 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-7">
            <div className="au1 mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-dark">
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
              Now open — Book online
            </div>

            <h1 className="au2 font-heading text-[2.6rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.02] text-ink">
              Play more.
              <br />
              <span className="gradient-text">Hassle less.</span>
            </h1>

            <p className="au3 mt-5 max-w-xl text-base sm:text-lg text-ink-soft">
              Book {BUSINESS.name}  courts and turfs in seconds — pick a sport, pick a slot, show up &amp; play.
            </p>

            <div className="au4 hidden md:flex flex-wrap gap-x-5 gap-y-2 mt-7 text-sm text-ink-soft">
              <TrustItem>Instant confirmation</TrustItem>
              <TrustItem>Pay on arrival</TrustItem>
              <TrustItem>Open 6 AM – 11 PM</TrustItem>
              <TrustItem>Free parking</TrustItem>
            </div>
          </div>

          {/* Quick-book widget */}
          <div className="au3 md:col-span-6 lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-primary-bright/15 to-transparent blur-2xl opacity-70" />

              <div className="relative rounded-3xl bg-white shadow-rich border border-border overflow-hidden">
                <div className="bg-gradient-to-br from-primary via-primary-dark to-primary-deep px-6 py-5 text-white">
                  <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/70">
                    Start booking
                  </div>
                  <div className="font-heading text-xl sm:text-2xl font-bold mt-1">
                    What&apos;s your game?
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="relative -mx-5 sm:-mx-6">
                    <div className="hero-pick-scroll flex gap-2.5 overflow-x-auto px-5 sm:px-6 pb-2 snap-x snap-mandatory">
                      {SPORTS.map((s) => {
                        const active = picked === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setPicked(s.id)}
                            className={`group flex w-[7.25rem] sm:w-32 shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl border p-3 sm:p-4 transition-all ${
                              active
                                ? "border-primary bg-primary-soft ring-2 ring-primary/20 -translate-y-0.5"
                                : "border-border bg-white hover:border-primary/40 hover:-translate-y-0.5"
                            }`}
                          >
                            <span className="text-3xl sm:text-4xl">{s.icon}</span>
                            <span
                              className={`text-xs sm:text-sm font-bold text-center leading-tight ${
                                active ? "text-primary-dark" : "text-ink"
                              }`}
                            >
                              {s.shortName}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-muted">
                              from {formatINR(s.priceINR)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {/* fade hint on right edge */}
                    <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent" />
                  </div>

                  <Link
                    href={`/book?sport=${picked}`}
                    className="btn-primary mt-5 flex items-center justify-center gap-2 rounded-2xl py-3.5 sm:py-4 text-sm sm:text-base font-semibold"
                  >
                    Find me a slot
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14m0 0l-6-6m6 6l-6 6"
                      />
                    </svg>
                  </Link>

                  <div className="mt-4 flex items-center justify-between text-[11px] sm:text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-bright animate-pulse" />
                      Live availability
                    </span>
                    <span>Pay on arrival</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-only trust strip below widget */}
          <div className="au4 md:hidden grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-ink-soft">
            <TrustItem>Instant confirmation</TrustItem>
            <TrustItem>Pay on arrival</TrustItem>
            <TrustItem>Open 6 AM – 11 PM</TrustItem>
            <TrustItem>Free parking</TrustItem>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-dark text-xs">
        ✓
      </span>
      {children}
    </div>
  );
}
