import Link from "next/link";
import { MEMBERSHIPS, formatINR, PUBLIC_WHATSAPP, BUSINESS } from "@/lib/constants";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function MembershipsPreview() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Memberships
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink">
              Play <span className="gradient-text">as much as you want</span>
            </h2>
            <p className="mt-4 text-ink-soft">
              Monthly passes for regulars. Cancel anytime.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {MEMBERSHIPS.map((m, i) => (
            <ScrollReveal key={m.name} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <div
                className={`h-full rounded-2xl p-6 shadow-soft transition-all hover:-translate-y-1 ${
                  m.featured
                    ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-rich"
                    : "border border-border bg-white"
                }`}
              >
                <h3 className={`font-heading text-lg font-bold mb-1 ${m.featured ? "text-white" : "text-ink"}`}>
                  {m.name}
                </h3>
                <div className={`text-3xl font-bold mb-1 ${m.featured ? "text-white" : "text-primary-dark"}`}>
                  {formatINR(m.priceINR)}
                </div>
                <div className={`text-xs uppercase tracking-wider mb-5 ${m.featured ? "text-white/70" : "text-muted"}`}>
                  {m.cadence}
                </div>
                <ul className={`space-y-1.5 text-sm ${m.featured ? "text-white/90" : "text-ink-soft"}`}>
                  {m.perks.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className={m.featured ? "text-white" : "text-primary"}>✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href={`https://wa.me/${PUBLIC_WHATSAPP}?text=${encodeURIComponent(
              `Hi ${BUSINESS.name}, I'd like to know more about memberships.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex rounded-full px-7 py-3 text-sm"
          >
            Enquire on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
