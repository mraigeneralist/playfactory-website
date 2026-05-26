import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BUSINESS } from "@/lib/constants";

export const metadata = {
  title: `Gallery — ${BUSINESS.name}`,
  description: `A look inside ${BUSINESS.name}.`,
};

interface Group {
  title: string;
  blurb: string;
  photos: { src: string; alt: string }[];
}

const GROUPS: Group[] = [
  {
    title: "Sports & Courts",
    blurb: "Where the games happen — badminton courts, cricket turf, table tennis tables.",
    photos: [
      { src: "/gallery/badminton-court1.jpg", alt: "Badminton court at PlayFactory" },
      { src: "/gallery/badminton-court2.jpg", alt: "Badminton court at PlayFactory" },
      { src: "/gallery/badminton-court3.jpg", alt: "Badminton court at PlayFactory" },
      { src: "/gallery/cricket1.jpg", alt: "Cricket turf at PlayFactory" },
      { src: "/gallery/tabletennis1.jpg", alt: "Table tennis at PlayFactory" },
    ],
  },
  {
    title: "Gym",
    blurb: "Fully equipped strength and cardio floor for members and guests.",
    photos: [
      { src: "/gallery/gym1.jpg", alt: "Gym floor at PlayFactory" },
      { src: "/gallery/gym2.jpg", alt: "Gym equipment at PlayFactory" },
      { src: "/gallery/gym3.jpg", alt: "Gym floor at PlayFactory" },
      { src: "/gallery/gym4.jpg", alt: "Gym equipment at PlayFactory" },
      { src: "/gallery/gym5.jpg", alt: "Gym floor at PlayFactory" },
    ],
  },
  {
    title: "Coaching & Classes",
    blurb: "Drawing, music, silambam — programs for kids and adults, all under one roof.",
    photos: [
      { src: "/gallery/drawing1.jpg", alt: "Drawing class at PlayFactory" },
      { src: "/gallery/drawing2.jpg", alt: "Drawing class at PlayFactory" },
      { src: "/gallery/drawing3.jpg", alt: "Drawing class at PlayFactory" },
      { src: "/gallery/music1.jpg", alt: "Music class at PlayFactory" },
      { src: "/gallery/music2.jpg", alt: "Music class at PlayFactory" },
      { src: "/gallery/music3.jpg", alt: "Music class at PlayFactory" },
      { src: "/gallery/silambam1.jpg", alt: "Silambam class at PlayFactory" },
    ],
  },
  {
    title: "Achievements",
    blurb: "Medals, trophies, and the players who've earned them.",
    photos: [
      { src: "/gallery/achievements1.jpg", alt: "PlayFactory achievement" },
      { src: "/gallery/achievements2.jpg", alt: "PlayFactory achievement" },
      { src: "/gallery/achievements3.jpg", alt: "PlayFactory achievement" },
      { src: "/gallery/achievements4.jpg", alt: "PlayFactory achievement" },
      { src: "/gallery/achievements5.jpg", alt: "PlayFactory achievement" },
      { src: "/gallery/achievements6.jpg", alt: "PlayFactory achievement" },
      { src: "/gallery/achievements7.jpg", alt: "PlayFactory achievement" },
    ],
  },
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

        {GROUPS.map((g) => (
          <section key={g.title} className="py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <ScrollReveal>
                <div className="mb-8 max-w-2xl">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-ink">
                    {g.title}
                  </h2>
                  <p className="mt-2 text-ink-soft">{g.blurb}</p>
                </div>
              </ScrollReveal>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {g.photos.map((p, i) => (
                  <ScrollReveal key={p.src} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                    <figure className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2 shadow-soft hover:shadow-rich transition-shadow">
                      <Image
                        src={p.src}
                        alt={p.alt}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </figure>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
