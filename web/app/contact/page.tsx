import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import { BUSINESS, PUBLIC_WHATSAPP } from "@/lib/constants";

export const metadata = {
  title: `Contact — ${BUSINESS.name}`,
  description: `Visit ${BUSINESS.name} at ${BUSINESS.address}.`,
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-surface to-surface-2 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Contact
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-ink">
              Come <span className="gradient-text">say hi</span>
            </h1>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white border border-border p-8 shadow-soft">
              <h2 className="font-heading text-2xl font-bold text-ink mb-6">
                Reach us
              </h2>
              <ul className="space-y-5 text-ink-soft">
                <li>
                  <div className="text-xs uppercase tracking-wider text-muted mb-1">Address</div>
                  <div className="font-medium text-ink">{BUSINESS.address}</div>
                </li>
                <li>
                  <div className="text-xs uppercase tracking-wider text-muted mb-1">Phone</div>
                  <a className="font-medium text-primary-dark hover:text-primary" href={`tel:+${BUSINESS.phone}`}>
                    {BUSINESS.phoneDisplay}
                  </a>
                </li>
                <li>
                  <div className="text-xs uppercase tracking-wider text-muted mb-1">WhatsApp</div>
                  <a
                    className="font-medium text-primary-dark hover:text-primary"
                    href={`https://wa.me/${PUBLIC_WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat with us
                  </a>
                </li>
                <li>
                  <div className="text-xs uppercase tracking-wider text-muted mb-1">Email</div>
                  <a className="font-medium text-primary-dark hover:text-primary" href={`mailto:${BUSINESS.email}`}>
                    {BUSINESS.email}
                  </a>
                </li>
                <li>
                  <div className="text-xs uppercase tracking-wider text-muted mb-1">Hours</div>
                  <div className="font-medium text-ink">{BUSINESS.hours}</div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl overflow-hidden border border-border shadow-soft min-h-[360px]">
              <iframe
                src={BUSINESS.mapEmbedSrc}
                className="h-full w-full min-h-[360px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
