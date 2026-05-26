// Email sender — Next.js → Apps Script.
// Apps Script is no longer a database; it's a thin worker that only sends
// the two booking-confirmation emails using the script-owner's Gmail.

const WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
const SECRET = process.env.SHEETS_WEBHOOK_SECRET;

export interface EmailJob {
  bookingId: string;
  sportName: string;
  date: string;
  slotTime: string;
  durationMin: number;
  priceINR: number;
  name: string;
  phone: string;
  email?: string;
}

export async function sendBookingEmails(job: EmailJob): Promise<void> {
  if (!WEBHOOK_URL || !SECRET) {
    console.warn("[email] Apps Script not configured; skipping send for", job.bookingId);
    return;
  }
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send_emails", _secret: SECRET, ...job }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[email] Apps Script returned", res.status, text);
    }
  } catch (err) {
    // Never throw — the booking is already saved; email failure shouldn't
    // bubble back to the customer.
    console.error("[email] send failed:", err);
  }
}
