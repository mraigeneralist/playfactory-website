import Link from "next/link";
import { BUSINESS, PUBLIC_WHATSAPP } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-20 bg-primary-deep text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              P
            </span>
            <span className="font-heading text-2xl font-bold">{BUSINESS.name}</span>
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
              <a
                className="hover:text-white"
                href={`https://wa.me/${PUBLIC_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`mailto:${BUSINESS.email}`}>
                {BUSINESS.email}
              </a>
            </li>
            <li className="pt-2 text-white/60">{BUSINESS.hours}</li>
          </ul>
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
