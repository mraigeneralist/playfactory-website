"use client";

import Link from "next/link";
import { formatSlotDisplay } from "@/lib/slots";
import { formatINR, PUBLIC_WHATSAPP, BUSINESS } from "@/lib/constants";
import { format } from "date-fns";

interface Props {
  bookingId: string;
  sportName: string;
  date: Date;
  slotTime: string;
  price: number;
  name: string;
}

export default function ConfirmStep({ bookingId, sportName, date, slotTime, price, name }: Props) {
  const summaryText = encodeURIComponent(
    `Hi ${BUSINESS.name}, my booking is confirmed.\n\nID: ${bookingId}\n${sportName}\n${format(date, "EEE, d MMM yyyy")} at ${formatSlotDisplay(slotTime)}`
  );

  return (
    <div className="text-center">
      <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
        <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h2 className="font-heading text-3xl font-bold text-ink">You're booked, {name}!</h2>
      <p className="mt-2 text-ink-soft">Show up 5 minutes early. Pay at the desk on arrival.</p>

      <div className="mt-8 inline-block min-w-[280px] rounded-2xl border border-border bg-surface p-6 text-left">
        <div className="text-xs uppercase tracking-wider text-muted">Booking ID</div>
        <div className="font-mono text-lg font-bold text-primary-dark">{bookingId}</div>

        <div className="my-4 border-t border-border" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Sport</dt>
            <dd className="font-semibold text-ink text-right">{sportName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Date</dt>
            <dd className="font-semibold text-ink">{format(date, "EEE, d MMM")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Time</dt>
            <dd className="font-semibold text-ink">{formatSlotDisplay(slotTime)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Price</dt>
            <dd className="font-bold text-primary-dark">{formatINR(price)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={`https://wa.me/${PUBLIC_WHATSAPP}?text=${summaryText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Save to WhatsApp
        </a>
        <Link
          href="/"
          className="rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-soft hover:bg-surface"
        >
          Done
        </Link>
      </div>
    </div>
  );
}
