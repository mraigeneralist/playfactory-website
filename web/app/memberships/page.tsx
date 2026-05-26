import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { MEMBERSHIPS, formatINR, PUBLIC_WHATSAPP, BUSINESS } from "@/lib/constants";

export const metadata = {
  title: `Memberships — ${BUSINESS.name}`,
  description: "Monthly memberships for badminton, table tennis and gym.",
};

const enquire = (plan: string) =>
  `https://wa.me/${PUBLIC_WHATSAPP}?text=${encodeURIComponent(
    `Hi ${BUSINESS.name}, I'd like the ${plan} membership.`
  )}`;

export default function MembershipsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-surface to-surface-2 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Memberships
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-ink">
              Pay once. <span className="gradient-text">Play all month.</span>
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-ink-soft text-lg">
              For regulars who'd rather not book one slot at a time. Unlimited open-play access during your batch hours.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {MEMBERSHIPS.map((m, i) => (
                <ScrollReveal key={m.name} delay={((i % 3) + 1) as 1 | 2 | 3}>
                  <div
                    className={`h-full flex flex-col rounded-2xl p-7 transition-all hover:-translate-y-1 ${
                      m.featured
                        ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-rich"
                        : "border border-border bg-white shadow-soft hover:shadow-rich"
                    }`}
                  >
                    {m.featured && (
                      <span className="self-start mb-4 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                        Most Popular
                      </span>
                    )}
                    <h3 className={`font-heading text-xl font-bold mb-2 ${m.featured ? "text-white" : "text-ink"}`}>
                      {m.name}
                    </h3>
                    <div className="mb-1">
                      <span className={`text-4xl font-bold ${m.featured ? "text-white" : "text-primary-dark"}`}>
                        {formatINR(m.priceINR)}
                      </span>
                    </div>
                    <div className={`text-xs uppercase tracking-wider mb-6 ${m.featured ? "text-white/80" : "text-muted"}`}>
                      {m.cadence}
                    </div>
                    <ul className={`space-y-2 text-sm mb-7 flex-1 ${m.featured ? "text-white/90" : "text-ink-soft"}`}>
                      {m.perks.map((p) => (
                        <li key={p} className="flex gap-2">
                          <span className={m.featured ? "text-white" : "text-primary"}>✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={enquire(m.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                        m.featured
                          ? "bg-white text-primary-dark hover:bg-primary-soft"
                          : "btn-primary"
                      }`}
                    >
                      Get Started
                    </a>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
