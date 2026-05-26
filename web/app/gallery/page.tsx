import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BUSINESS } from "@/lib/constants";

export const metadata = {
  title: `Gallery — ${BUSINESS.name}`,
  description: `A look inside ${BUSINESS.name}.`,
};

// Each tile gets a placeholder gradient + emoji until real photos drop in.
// TODO: Replace with real images in /public/gallery/* and swap to <Image />.
const TILES = [
  { icon: "🏸", label: "Badminton Courts", grad: "from-emerald-400 to-emerald-600" },
  { icon: "🏏", label: "Cricket Turf", grad: "from-lime-400 to-emerald-700" },
  { icon: "🏓", label: "TT Tables", grad: "from-teal-400 to-emerald-600" },
  { icon: "💪", label: "Gym Floor", grad: "from-green-500 to-emerald-800" },
  { icon: "🎯", label: "Coaching Sessions", grad: "from-emerald-500 to-teal-700" },
  { icon: "🏆", label: "Tournaments", grad: "from-lime-500 to-green-700" },
  { icon: "🎉", label: "Events", grad: "from-emerald-400 to-green-600" },
  { icon: "👟", label: "Locker Room", grad: "from-teal-500 to-emerald-700" },
];

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-surface to-surface-2 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Gallery
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-ink">
              Inside <span className="gradient-text">{BUSINESS.name}</span>
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-ink-soft text-lg">
              A peek at our courts, coaching sessions and the players who make this place tick.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TILES.map((t, i) => (
                <ScrollReveal key={t.label} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                  <div
                    className={`aspect-square rounded-2xl bg-gradient-to-br ${t.grad} flex flex-col items-center justify-center text-white shadow-soft hover:shadow-rich transition-all hover:-translate-y-1`}
                  >
                    <div className="text-6xl mb-3">{t.icon}</div>
                    <div className="font-heading font-bold text-lg">{t.label}</div>
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
