import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { COACHING, formatINR, PUBLIC_WHATSAPP, BUSINESS } from "@/lib/constants";

export const metadata = {
  title: `Coaching — ${BUSINESS.name}`,
  description: "Professional coaching for badminton, table tennis, dance, drawing, silambam and cricket.",
};

const CATEGORY_ORDER = ["Badminton", "Table Tennis", "Cricket", "Dance", "Drawing", "Silambam"] as const;

const enquire = (program: string) =>
  `https://wa.me/${PUBLIC_WHATSAPP}?text=${encodeURIComponent(
    `Hi ${BUSINESS.name}, I'd like to enquire about: ${program}`
  )}`;

export default function CoachingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-surface to-surface-2 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Coaching
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-ink">
              Programs for every <span className="gradient-text">player & age</span>
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-ink-soft text-lg">
              From your first shuttle hit to tournament-grade training — built by coaches who play the game.
            </p>
          </div>
        </section>

        {CATEGORY_ORDER.map((cat) => {
          const items = COACHING.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat} className="py-12 md:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <ScrollReveal>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-ink mb-8">
                    {cat}
                  </h2>
                </ScrollReveal>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((c, i) => (
                    <ScrollReveal key={c.name} delay={((i % 3) + 1) as 1 | 2 | 3}>
                      <div className="h-full flex flex-col rounded-2xl border border-border bg-white p-6 shadow-soft hover:shadow-rich hover:border-primary/30 transition-all">
                        <h3 className="font-heading text-lg font-bold text-ink mb-3">
                          {c.name}
                        </h3>
                        <div className="mb-4">
                          <span className="text-2xl font-bold text-primary-dark">
                            {formatINR(c.priceINR)}
                          </span>
                          <span className="text-xs uppercase tracking-wider text-muted ml-2">
                            {c.cadence}
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-sm text-ink-soft mb-6 flex-1">
                          {c.highlights.map((h) => (
                            <li key={h} className="flex gap-2">
                              <span className="text-primary">✓</span>
                              {h}
                            </li>
                          ))}
                        </ul>
                        <a
                          href={enquire(c.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary inline-flex justify-center rounded-full px-5 py-2.5 text-sm"
                        >
                          Enquire on WhatsApp
                        </a>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
