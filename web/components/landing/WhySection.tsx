import ScrollReveal from "@/components/ui/ScrollReveal";

const REASONS = [
  {
    icon: "⚡",
    title: "60-second booking",
    body: "Pick a sport, date and slot. Confirm. Done. No phone calls.",
  },
  {
    icon: "🏆",
    title: "Pro-grade facility",
    body: "Wooden courts, fiber shuttles, turf-grade pitch and certified coaches.",
  },
  {
    icon: "💬",
    title: "WhatsApp-first support",
    body: "Booking confirmations, reminders and rescheduling — all from chat.",
  },
  {
    icon: "💰",
    title: "Pay on arrival",
    body: "No advance payment. Cash, UPI or card — pay when you walk in.",
  },
];

export default function WhySection() {
  return (
    <section className="py-20 md:py-28 bg-primary-deep text-white relative overflow-hidden">
      <div className="dot-tex absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary-bright mb-3">
              Why PlayFactory
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Built for players who'd rather <span className="text-primary-bright">be playing</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <ScrollReveal key={r.title} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="text-3xl mb-3">{r.icon}</div>
                <h3 className="font-heading text-lg font-bold mb-2">{r.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{r.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
