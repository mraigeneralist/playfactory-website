// Email sender — Next.js → Apps Script.
// Apps Script is no longer a database; it's a thin worker that only sends
// the two booking-confirmation emails using the script-owner's Gmail.
//
// Reliability: Apps Script Web Apps occasionally close TCP connections
// mid-flight ("other side closed" / socket errors). We retry once with a
// short backoff before giving up. The send is fire-and-forget from the
// caller's perspective — failures only log, never block the booking.

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

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = 600;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function postOnce(body: string): Promise<{ ok: boolean; status: number; text: string }> {
  // Apps Script /exec POSTs return a 302 to script.googleusercontent.com.
  // Node's undici follows redirects by default; explicit redirect:"follow"
  // documents intent.
  const res = await fetch(WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    redirect: "follow",
    cache: "no-store",
  });
  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, text };
}

export async function sendBookingEmails(job: EmailJob): Promise<void> {
  if (!WEBHOOK_URL || !SECRET) {
    console.warn("[email] Apps Script not configured; skipping send for", job.bookingId);
    return;
  }

  const body = JSON.stringify({ action: "send_emails", _secret: SECRET, ...job });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const r = await postOnce(body);
      if (r.ok) {
        console.log("[email] sent", job.bookingId, "attempt", attempt);
        return;
      }
      console.error(
        "[email] Apps Script returned",
        r.status,
        r.text.slice(0, 200),
        "(attempt",
        attempt,
        "of",
        MAX_ATTEMPTS + ")"
      );
      // Non-network failures (401/403/4xx) won't be fixed by a retry —
      // don't loop on them.
      if (r.status >= 400 && r.status < 500) return;
    } catch (err) {
      console.error("[email] send failed (attempt", attempt, "of", MAX_ATTEMPTS + "):", err);
    }
    if (attempt < MAX_ATTEMPTS) await sleep(BACKOFF_MS * attempt);
  }
  console.error("[email] gave up after", MAX_ATTEMPTS, "attempts for", job.bookingId);
}
