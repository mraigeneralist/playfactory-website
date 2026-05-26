import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-20 bg-primary-deep text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-4">
            <Logo className="text-3xl sm:text-4xl" variant="light" />
          </div>
          <p className="text-white/70 max-w-md text-sm leading-relaxed">
            {BUSINESS.tagline}. Book courts and join coaching programs at
            Chennai's friendliest sports facility.
          </p>
        </div>

        <div>
          <h4 className="font-heading text-sm uppercase tracking-wider mb-4 text-primary-soft">
            Explore
          </h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/book" className="hover:text-white">Book a Slot</Link></li>
            <li><Link href="/coaching" className="hover:text-white">Coaching</Link></li>
            <li><Link href="/memberships" className="hover:text-white">Memberships</Link></li>
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm uppercase tracking-wider mb-4 text-primary-soft">
            Reach us
          </h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li>{BUSINESS.address}</li>
            <li>
              <a className="hover:text-white" href={`tel:+${BUSINESS.phone}`}>
                {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`tel:+${BUSINESS.phone2}`}>
                {BUSINESS.phone2Display}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`mailto:${BUSINESS.email}`}>
                {BUSINESS.email}
              </a>
            </li>
            <li className="pt-2 text-white/60">{BUSINESS.hours}</li>
          </ul>

          <div className="mt-5 flex items-center gap-3">
            <a
              href={BUSINESS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-primary hover:text-white transition-colors"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-primary hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.6 4 12 4 12 4s-7.6 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.3.1 12 .1 12s0 3.7.4 5.5a3 3 0 0 0 2.1 2.1c1.8.4 9.4.4 9.4.4s7.6 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.8.4-5.5.4-5.5s0-3.7-.4-5.5zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
              </svg>
            </a>
            <a
              href={BUSINESS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-primary hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-xs text-white/50 flex flex-col sm:flex-row gap-2 justify-between">
          <span>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</span>
          <span>Built with care.</span>
        </div>
      </div>
    </footer>
  );
}
