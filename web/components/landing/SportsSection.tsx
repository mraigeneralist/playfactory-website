import Link from "next/link";
import { SPORTS, formatINR } from "@/lib/constants";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function SportsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Book Online
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink">
              Pick a sport. Pick a slot. <span className="gradient-text">Show up & play.</span>
            </h2>
            <p className="mt-4 text-ink-soft">
              No phone calls, no waiting. Booking takes under 60 seconds.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SPORTS.map((s, i) => (
            <ScrollReveal key={s.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <Link
                href={`/book?sport=${s.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-rich hover:border-primary/30"
              >
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{s.icon}</span>
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
                      {formatINR(s.priceINR)}/hr
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-ink mb-2">
                    {s.shortName}
                  </h3>
                  <p className="text-sm text-ink-soft mb-5">{s.description}</p>
                  <div className="mt-auto text-sm text-muted">
                    {s.courts} {s.courts === 1 ? "court" : "courts"} · 1 hour
                  </div>
                </div>
                <div className="btn-primary flex items-center justify-center gap-2 rounded-none px-6 py-4 text-sm font-semibold">
                  Book this court
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                  </svg>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
