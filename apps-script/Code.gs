/**
 * PlayFactory — Apps Script email-only worker.
 *
 * As of the Supabase migration, this script no longer reads or writes
 * spreadsheet data. Its only job is to send two emails (owner + customer)
 * whenever Next.js POSTs `action=send_emails` after a booking is saved.
 *
 * SETUP:
 *  1. Open the script attached to your Google Sheet (or create a new
 *     standalone script — the sheet is no longer required).
 *  2. Replace the file contents with this entire file.
 *  3. Edit the constants below. SECRET must match SHEETS_WEBHOOK_SECRET
 *     in your Next.js env.
 *  4. Deploy → Manage deployments → New version → Deploy. URL stays the same.
 *  5. First booking after deploy will prompt you to authorize MailApp once.
 */

// ─── EDIT THESE ──────────────────────────────────────────────────────────────
const SECRET = "REPLACE_WITH_LONG_RANDOM_STRING"; // must match SHEETS_WEBHOOK_SECRET
const OWNER_EMAIL = "owner@playfactory.in";       // TODO: replace
const BUSINESS_NAME = "PlayFactory";
const BUSINESS_ADDRESS = "123 Sports Avenue, Chennai, Tamil Nadu 600001"; // TODO
const BUSINESS_PHONE = "+91 98765 43210";                                  // TODO
// ─────────────────────────────────────────────────────────────────────────────

function doGet() {
  return jsonResp({ ok: true, role: "email-worker" });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (body._secret !== SECRET) {
      return jsonResp({ success: false, error: "Unauthorized" }, 401);
    }
    delete body._secret;

    if (body.action !== "send_emails") {
      return jsonResp({ success: false, error: "Unknown action" }, 400);
    }

    const b = {
      bookingId:   body.bookingId   || "",
      sportName:   body.sportName   || "",
      date:        body.date        || "",
      slotTime:    body.slotTime    || "",
      durationMin: body.durationMin || 60,
      priceINR:    body.priceINR    || 0,
      name:        body.name        || "",
      phone:       body.phone       || "",
      email:       body.email       || "",
      source:      body.source      || "website",
    };

    const out = { owner: false, customer: false };
    try { sendOwnerEmail(b.bookingId, b); out.owner = true; }
    catch (err) { Logger.log("owner email failed: " + err); }
    if (b.email) {
      try { sendCustomerEmail(b.bookingId, b); out.customer = true; }
      catch (err) { Logger.log("customer email failed: " + err); }
    }
    return jsonResp({ success: true, sent: out });
  } catch (err) {
    return jsonResp({ success: false, error: String(err && err.message || err) }, 500);
  }
}

// ─── EMAIL TEMPLATES ────────────────────────────────────────────────────────

function sendOwnerEmail(id, b) {
  if (!OWNER_EMAIL) return;
  const subject = "New booking — " + b.sportName + " — " + b.date + " " + b.slotTime;
  const html =
    '<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">' +
      '<div style="background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;padding:20px 24px;border-radius:14px 14px 0 0;">' +
        '<div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:0.85;">New Booking</div>' +
        '<div style="font-size:22px;font-weight:700;margin-top:4px;">' + escapeHtml(b.sportName) + '</div>' +
      '</div>' +
      '<div style="border:1px solid #e3ede7;border-top:none;border-radius:0 0 14px 14px;padding:22px 24px;background:#fff;">' +
        '<table style="width:100%;font-size:14px;border-collapse:collapse;">' +
          row("Booking ID", id) +
          row("Date", b.date) +
          row("Time", b.slotTime) +
          row("Duration", b.durationMin + " min") +
          row("Price", "₹" + b.priceINR) +
          row("Name", b.name) +
          row("Phone", b.phone) +
          row("Email", b.email || "—") +
          row("Source", b.source) +
        '</table>' +
        '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #f0f4f1;color:#6b7c73;font-size:12px;">' +
          'Sent automatically by your PlayFactory backend.' +
        '</div>' +
      '</div>' +
    '</div>';
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: subject,
    htmlBody: html,
    name: BUSINESS_NAME + " Bookings",
  });
}

function sendCustomerEmail(id, b) {
  const subject = "You're booked at " + BUSINESS_NAME + " — " + b.date + " " + b.slotTime;
  const html =
    '<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">' +
      '<div style="text-align:center;margin-bottom:18px;">' +
        '<div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;background:#dcfce7;color:#15803d;font-size:32px;">✓</div>' +
      '</div>' +
      '<div style="border:1px solid #e3ede7;border-radius:14px;padding:24px;background:#fff;">' +
        '<h2 style="margin:0 0 8px;color:#0a1f14;font-family:system-ui,sans-serif;">You\'re booked, ' + escapeHtml(b.name) + '!</h2>' +
        '<p style="margin:0 0 18px;color:#4b5d54;">Show up 5 minutes early. Pay at the desk on arrival.</p>' +
        '<table style="width:100%;font-size:14px;border-collapse:collapse;">' +
          row("Booking ID", id) +
          row("Sport", b.sportName) +
          row("Date", b.date) +
          row("Time", b.slotTime) +
          row("Price", "₹" + b.priceINR) +
        '</table>' +
        '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #f0f4f1;color:#6b7c73;font-size:13px;line-height:1.6;">' +
          '<strong style="color:#0a1f14;">' + BUSINESS_NAME + '</strong><br>' +
          BUSINESS_ADDRESS + '<br>' +
          BUSINESS_PHONE +
        '</div>' +
      '</div>' +
      '<p style="text-align:center;color:#6b7c73;font-size:12px;margin-top:16px;">' +
        'Need to cancel or reschedule? Reply to this email or WhatsApp us.' +
      '</p>' +
    '</div>';
  MailApp.sendEmail({
    to: b.email,
    subject: subject,
    htmlBody: html,
    name: BUSINESS_NAME,
  });
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function row(label, value) {
  return '<tr>' +
    '<td style="padding:6px 0;color:#6b7c73;width:120px;">' + label + '</td>' +
    '<td style="padding:6px 0;color:#0a1f14;font-weight:600;">' + escapeHtml(String(value)) + '</td>' +
  '</tr>';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function jsonResp(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── DEBUG ──────────────────────────────────────────────────────────────────
// Runnable from the editor with no args to test email sending.
function debugSendOwnerEmail() {
  sendOwnerEmail("PF-TEST-001", {
    sportName: "Badminton Court",
    date: "2026-05-27",
    slotTime: "19:00",
    durationMin: 60,
    priceINR: 400,
    name: "Test Person",
    phone: "9876543210",
    email: "",
    source: "website",
  });
  Logger.log("debug send complete — check inbox");
}
