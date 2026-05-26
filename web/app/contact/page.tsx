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
                  <a className="block font-medium text-primary-dark hover:text-primary" href={`tel:+${BUSINESS.phone}`}>
                    {BUSINESS.phoneDisplay}
                  </a>
                  <a className="block font-medium text-primary-dark hover:text-primary" href={`tel:+${BUSINESS.phone2}`}>
                    {BUSINESS.phone2Display}
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
                <li>
                  <div className="text-xs uppercase tracking-wider text-muted mb-2">Follow us</div>
                  <div className="flex items-center gap-3">
                    <a
                      href={BUSINESS.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary-dark hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 12.07C22 6.5 17.52 2 12 2S2 6.5 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.54V9.84c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.75 8.43-4.91 8.43-9.93z" />
                      </svg>
                    </a>
                    <a
                      href={BUSINESS.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary-dark hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.6 4 12 4 12 4s-7.6 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.3.1 12 .1 12s0 3.7.4 5.5a3 3 0 0 0 2.1 2.1c1.8.4 9.4.4 9.4.4s7.6 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.8.4-5.5.4-5.5s0-3.7-.4-5.5zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
                      </svg>
                    </a>
                    <a
                      href={BUSINESS.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Website"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary-dark hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                      </svg>
                    </a>
                  </div>
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
