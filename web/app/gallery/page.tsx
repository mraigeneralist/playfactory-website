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

interface Photo {
  src: string;
  label: string;
  alt: string;
}

const PHOTOS: Photo[] = [
  { src: "/gallery/badminton-court1.jpg", label: "Badminton", alt: "Badminton court at PlayFactory" },
  { src: "/gallery/badminton-court2.jpg", label: "Badminton", alt: "Badminton court at PlayFactory" },
  { src: "/gallery/badminton-court3.jpg", label: "Badminton", alt: "Badminton court at PlayFactory" },
  { src: "/gallery/tabletennis1.jpg", label: "Table Tennis", alt: "Table tennis at PlayFactory" },
  { src: "/gallery/cricket1.jpg", label: "Cricket", alt: "Cricket turf at PlayFactory" },
  { src: "/gallery/silambam1.jpg", label: "Silambam", alt: "Silambam class at PlayFactory" },
  { src: "/gallery/drawing1.jpg", label: "Drawing", alt: "Drawing class at PlayFactory" },
  { src: "/gallery/drawing2.jpg", label: "Drawing", alt: "Drawing class at PlayFactory" },
  { src: "/gallery/drawing3.jpg", label: "Drawing", alt: "Drawing class at PlayFactory" },
  { src: "/gallery/music1.jpg", label: "Music", alt: "Music class at PlayFactory" },
  { src: "/gallery/music2.jpg", label: "Music", alt: "Music class at PlayFactory" },
  { src: "/gallery/music3.jpg", label: "Music", alt: "Music class at PlayFactory" },
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {PHOTOS.map((p, i) => (
                <ScrollReveal key={p.src} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                  <figure className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2 shadow-soft hover:shadow-rich transition-shadow">
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                      <figcaption className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                        {p.label}
                      </figcaption>
                    </div>
                  </figure>
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
