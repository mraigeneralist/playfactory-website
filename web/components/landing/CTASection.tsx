import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { PUBLIC_WHATSAPP, BUSINESS } from "@/lib/constants";

export default function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="rounded-[2rem] bg-gradient-to-br from-primary via-primary-dark to-primary-deep p-10 md:p-16 text-center text-white shadow-rich relative overflow-hidden">
            <div className="dot-tex absolute inset-0 opacity-30" />
            <div className="relative">
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold">
                Ready to play?
              </h2>
              <p className="mt-4 text-lg text-white/85 max-w-xl mx-auto">
                Grab a slot for tonight or plan ahead. We've got courts, coaches
                and good vibes waiting.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-primary-dark hover:bg-primary-soft transition-colors"
                >
                  Book a Slot
                </Link>
                <a
                  href={`https://wa.me/${PUBLIC_WHATSAPP}?text=${encodeURIComponent(`Hi ${BUSINESS.name}!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
