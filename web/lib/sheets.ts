// Server-side client for the Google Apps Script Web App that backs our sheet.
// Never import from the browser — the SECRET lives in env and we relay
// requests through Next API routes.

import type { BookingPayload, BookingResult, Slot, AdminBooking } from "./types";

const WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
const SECRET = process.env.SHEETS_WEBHOOK_SECRET;

function assertConfigured() {
  if (!WEBHOOK_URL || !SECRET) {
    throw new Error(
      "Sheets backend not configured. Set SHEETS_WEBHOOK_URL and SHEETS_WEBHOOK_SECRET in .env.local"
    );
  }
}

export async function fetchSlots(params: {
  sport: string;
  date: string;
}): Promise<Slot[]> {
  assertConfigured();
  const url = `${WEBHOOK_URL}?action=slots&sport=${encodeURIComponent(params.sport)}&date=${encodeURIComponent(params.date)}`;
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Sheets fetch failed: ${res.status}`);
  const json = await res.json();
  return (json.slots as Slot[]) || [];
}

export async function createBooking(
  payload: BookingPayload
): Promise<BookingResult> {
  assertConfigured();
  // Apps Script doPost can't read custom headers reliably, so we send the
  // shared secret in the body. The Web App is HTTPS-only so this is fine.
  const res = await fetch(WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "book", _secret: SECRET, ...payload }),
  });
  const json = (await res.json()) as BookingResult & {
    booking_id?: string;
  };
  if (!res.ok || !json.success) {
    return { success: false, error: json.error || "Booking failed" };
  }
  return { success: true, bookingId: json.bookingId || json.booking_id };
}

export async function fetchAllBookings(): Promise<AdminBooking[]> {
  assertConfigured();
  const url = `${WEBHOOK_URL}?action=admin_bookings&_secret=${encodeURIComponent(SECRET!)}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`Admin fetch failed: ${res.status}`);
  const json = await res.json();
  return (json.bookings as AdminBooking[]) || [];
}
