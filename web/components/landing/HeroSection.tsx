import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-surface via-white to-surface-2">
      <div className="dot-tex absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="au1 mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-dark">
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
              Now open — Book online
            </div>

            <h1 className="au2 font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] text-ink">
              Play more.
              <br />
              <span className="gradient-text">Hassle less.</span>
            </h1>

            <p className="au3 mt-6 max-w-xl text-lg text-ink-soft">
              Book badminton courts, cricket turf and table tennis at{" "}
              <strong>{BUSINESS.name}</strong> in seconds. Pro coaching, flexible
              memberships, and the friendliest crowd in town.
            </p>

            <div className="au4 mt-8 flex flex-wrap gap-3">
              <Link
                href="/book"
                prefetch
                className="btn-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base"
              >
                Book a Slot
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                </svg>
              </Link>
              <Link
                href="/coaching"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-7 py-3.5 text-base font-semibold text-primary-dark hover:bg-primary-soft transition-colors"
              >
                View Coaching
              </Link>
            </div>

            <div className="au4 mt-10 grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-6 text-sm text-ink-soft">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary-dark">✓</span>
                Instant confirmation
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary-dark">✓</span>
                Pay on arrival
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary-dark">✓</span>
                Open 6 AM – 11 PM
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary-dark">✓</span>
                Free parking on-site
              </div>
            </div>
          </div>

          <div className="au3 relative px-6 sm:px-8 md:px-0 pt-6 md:pt-0 pb-10 md:pb-0">
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-dark to-primary-deep shadow-rich" />
              <div className="absolute inset-3 rounded-[1.7rem] sm:rounded-[2.2rem] bg-white overflow-hidden flex items-center justify-center">
                <div className="text-center p-6 sm:p-8">
                  <div className="text-7xl sm:text-8xl mb-3 sm:mb-4">🏸</div>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-primary-deep">Game On.</div>
                  <div className="mt-2 text-sm text-ink-soft">Courts available every hour</div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 sm:-bottom-6 sm:-left-6 rounded-2xl bg-white shadow-rich px-4 py-3 sm:px-5 sm:py-4 border border-border">
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-muted">Today</div>
                <div className="font-heading text-lg sm:text-2xl font-bold text-primary-dark">12 slots free</div>
              </div>
              <div className="absolute -top-5 -right-3 sm:-top-6 sm:-right-6 rounded-2xl bg-primary text-white shadow-rich px-4 py-3 sm:px-5 sm:py-4">
                <div className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80">Coaching</div>
                <div className="font-heading text-base sm:text-xl font-bold">8 programs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
