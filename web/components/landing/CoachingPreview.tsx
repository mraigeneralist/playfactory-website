import Link from "next/link";
import { COACHING, formatINR, PUBLIC_WHATSAPP, BUSINESS } from "@/lib/constants";
import ScrollReveal from "@/components/ui/ScrollReveal";

const CATEGORY_ICONS: Record<string, string> = {
  Badminton: "🏸",
  "Table Tennis": "🏓",
  Dance: "💃",
  Drawing: "🎨",
  Silambam: "🥢",
  Cricket: "🏏",
};

const enquireUrl = (category: string) =>
  `https://wa.me/${PUBLIC_WHATSAPP}?text=${encodeURIComponent(
    `Hi ${BUSINESS.name}, I'd like to enquire about ${category} coaching.`
  )}`;

export default function CoachingPreview() {
  const categories = Array.from(new Set(COACHING.map((c) => c.category)));

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Coaching
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink">
              Learn from <span className="gradient-text">people who play</span>
            </h2>
            <p className="mt-4 text-ink-soft">
              Programs for every level, age and ambition.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const sample = COACHING.find((c) => c.category === cat)!;
            const count = COACHING.filter((c) => c.category === cat).length;
            const minPrice = Math.min(
              ...COACHING.filter((c) => c.category === cat).map((c) => c.priceINR)
            );
            return (
              <ScrollReveal key={cat} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <a
                  href={enquireUrl(cat)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-rich hover:border-primary/30"
                >
                  <div className="flex flex-1 flex-col p-6">
                    <div className="text-3xl mb-3">{CATEGORY_ICONS[cat]}</div>
                    <h3 className="font-heading text-xl font-bold text-ink mb-1">{cat}</h3>
                    <p className="text-sm text-ink-soft">
                      {count} {count === 1 ? "program" : "programs"} · from{" "}
                      <span className="font-semibold text-primary-dark">
                        {formatINR(minPrice)}
                      </span>{" "}
                      {sample.cadence}
                    </p>
                  </div>
                  <div className="btn-primary flex items-center justify-center gap-2 rounded-none px-6 py-4 text-sm font-semibold">
                    Enquire on WhatsApp
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
                </a>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/coaching"
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-7 py-3 font-semibold text-primary-dark hover:bg-primary-soft transition-colors"
          >
            View all coaching programs
          </Link>
        </div>
      </div>
    </section>
  );
}
