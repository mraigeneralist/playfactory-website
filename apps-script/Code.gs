/**
 * PlayFactory — Google Apps Script Web App backend.
 *
 * SETUP (~5 minutes):
 *  1. Create a new Google Sheet. Name it "PlayFactory Bookings".
 *  2. Add three tabs (rename Sheet1 to "Bookings", then add the other two):
 *
 *     "Bookings"  (row 1 = header)
 *     ──────────────────────────────────────────────────────────────────────
 *     booking_id | created_at | sport | sport_name | date | slot_time |
 *     duration_min | price | name | phone | email | status | source
 *
 *     "Config"  (row 1 = header) — describes courts per sport.
 *     Pre-fill rows matching the SPORTS in web/lib/constants.ts.
 *     ──────────────────────────────────────────────────────────────────────
 *     sport            | open_time | close_time | slot_duration_min | court_count | price
 *     badminton-court  | 06:00     | 23:00      | 60                | 4           | 400
 *     badminton-guest  | 06:00     | 23:00      | 60                | 8           | 150
 *     cricket-turf     | 06:00     | 23:00      | 60                | 1           | 1200
 *     tt-court         | 06:00     | 23:00      | 60                | 2           | 250
 *     tt-guest         | 06:00     | 23:00      | 60                | 4           | 100
 *
 *     "Blocked"  (row 1 = header) — manual slot blocks for maintenance/tournaments.
 *     ──────────────────────────────────────────────────────────────────────
 *     date         | sport            | slot_time | reason
 *     2026-06-01   | badminton-court  | 19:00     | Tournament finals
 *
 *  3. Extensions → Apps Script. Paste this entire file (replace Code.gs).
 *  4. Edit the SECRET constant below to match SHEETS_WEBHOOK_SECRET in your
 *     Next.js .env.local. Use a long random string.
 *  5. Deploy → New deployment → "Web app".
 *       - Execute as: Me (your account)
 *       - Who has access: Anyone
 *     Click Deploy, authorize, copy the "/exec" URL into SHEETS_WEBHOOK_URL.
 *  6. Any time you change THIS file you must redeploy (Deploy → Manage
 *     deployments → edit pencil → New version → Deploy).
 */

// ─── EDIT THESE ──────────────────────────────────────────────────────────────
const SECRET = "REPLACE_WITH_LONG_RANDOM_STRING"; // must match SHEETS_WEBHOOK_SECRET
const TIMEZONE = "Asia/Kolkata";

// Email notifications. Apps Script sends as the Google account that owns the
// script. Leave OWNER_EMAIL blank to disable owner notifications.
const OWNER_EMAIL = "owner@playfactory.in"; // TODO: replace with real owner email
const BUSINESS_NAME = "PlayFactory";
const BUSINESS_ADDRESS = "123 Sports Avenue, Chennai, Tamil Nadu 600001"; // TODO
const BUSINESS_PHONE = "+91 98765 43210"; // TODO
// ─────────────────────────────────────────────────────────────────────────────

const TAB_BOOKINGS = "Bookings";
const TAB_CONFIG = "Config";
const TAB_BLOCKED = "Blocked";

function doGet(e) {
  try {
    const action = (e.parameter.action || "").toString();
    if (action === "slots") return jsonResp(getSlots(e.parameter.sport, e.parameter.date));
    if (action === "admin_bookings") {
      if (e.parameter._secret !== SECRET) {
        return jsonResp({ error: "Unauthorized" }, 401);
      }
      return jsonResp(getAllBookings());
    }
    return jsonResp({ ok: true, message: "PlayFactory backend up." });
  } catch (err) {
    return jsonResp({ error: String(err && err.message || err) }, 500);
  }
}

function doPost(e) {
  try {
    // Apps Script can't read custom headers directly via doPost — clients must
    // pass the secret in the JSON body. We accept either header (when going
    // through a proxy that forwards them) or body for robustness.
    const headerAuth = (e && e.parameter && e.parameter.auth) || null;
    const body = JSON.parse(e.postData.contents || "{}");
    const provided = body._secret || headerAuth;
    if (provided !== SECRET) {
      return jsonResp({ success: false, error: "Unauthorized" }, 401);
    }
    delete body._secret;

    const action = body.action || "book";
    if (action === "book") return jsonResp(createBooking(body));
    return jsonResp({ success: false, error: "Unknown action" }, 400);
  } catch (err) {
    return jsonResp({ success: false, error: String(err && err.message || err) }, 500);
  }
}

// ─── HANDLERS ────────────────────────────────────────────────────────────────

function getSlots(sport, dateStr) {
  if (!sport || !dateStr) throw new Error("Missing sport or date");

  const cfg = readConfig()[sport];
  if (!cfg) throw new Error("Unknown sport: " + sport);

  const allSlots = generateHourlySlots(cfg.openTime, cfg.closeTime);
  const bookings = countBookingsByTime(sport, dateStr);
  const blocked = readBlockedSet(sport, dateStr);

  const slots = allSlots.map(function (time) {
    const used = bookings[time] || 0;
    const isBlocked = blocked[time];
    const remaining = isBlocked ? 0 : Math.max(0, cfg.courtCount - used);
    return { time: time, remaining: remaining, available: remaining > 0 };
  });

  return { slots: slots };
}

function createBooking(b) {
  const required = ["sport", "sportName", "date", "slotTime", "durationMin", "priceINR", "name", "phone"];
  for (var i = 0; i < required.length; i++) {
    if (b[required[i]] === undefined || b[required[i]] === null || b[required[i]] === "") {
      return { success: false, error: "Missing field: " + required[i] };
    }
  }
  if (!/^[6-9]\d{9}$/.test(b.phone)) return { success: false, error: "Invalid phone" };

  // Capacity check (race-safe within a single script execution thanks to LockService)
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const cfg = readConfig()[b.sport];
    if (!cfg) return { success: false, error: "Unknown sport" };

    const blocked = readBlockedSet(b.sport, b.date);
    if (blocked[b.slotTime]) return { success: false, error: "This slot is blocked." };

    const counts = countBookingsByTime(b.sport, b.date);
    const used = counts[b.slotTime] || 0;
    if (used >= cfg.courtCount) {
      return { success: false, error: "This slot just got fully booked. Pick another." };
    }

    const id = "PF" + Utilities.formatDate(new Date(), TIMEZONE, "yyyyMMdd-HHmmss") + "-" +
      Math.floor(Math.random() * 1000).toString().padStart(3, "0");

    const sh = sheet(TAB_BOOKINGS);
    sh.appendRow([
      id,
      Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss"),
      b.sport,
      b.sportName,
      b.date,
      b.slotTime,
      b.durationMin,
      b.priceINR,
      b.name,
      "'" + b.phone, // leading apostrophe forces text — preserves leading digits
      b.email || "",
      "confirmed",
      b.source || "website",
    ]);

    // Fire-and-forget notifications. Wrapped in try/catch so an email failure
    // never blocks the booking response — the row is already saved.
    try { sendOwnerEmail(id, b); } catch (e) { Logger.log("owner email failed: " + e); }
    if (b.email) {
      try { sendCustomerEmail(id, b); } catch (e) { Logger.log("customer email failed: " + e); }
    }

    return { success: true, bookingId: id };
  } finally {
    lock.releaseLock();
  }
}

// ─── EMAIL NOTIFICATIONS ─────────────────────────────────────────────────────

function sendOwnerEmail(id, b) {
  if (!OWNER_EMAIL) return;
  const subject = "New booking — " + b.sportName + " — " + b.date + " " + b.slotTime;
  const html =
    '<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">' +
      '<div style="background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;padding:20px 24px;border-radius:14px 14px 0 0;">' +
        '<div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:0.85;">New Booking</div>' +
        '<div style="font-size:22px;font-weight:700;margin-top:4px;">' + b.sportName + '</div>' +
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
          row("Source", b.source || "website") +
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

function row(label, value) {
  return '<tr>' +
    '<td style="padding:6px 0;color:#6b7c73;width:120px;">' + label + '</td>' +
    '<td style="padding:6px 0;color:#0a1f14;font-weight:600;">' + escapeHtml(String(value)) + '</td>' +
  '</tr>';
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// ─── ADMIN READS ─────────────────────────────────────────────────────────────

function getAllBookings() {
  const rows = sheet(TAB_BOOKINGS).getDataRange().getValues();
  // header: booking_id|created_at|sport|sport_name|date|slot_time|
  //         duration_min|price|name|phone|email|status|source
  const out = [];
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    out.push({
      bookingId: String(r[0]),
      createdAt: formatDateTimeCell(r[1]),
      sport: String(r[2] || "").trim(),
      sportName: String(r[3] || ""),
      date: formatDateCell(r[4]),
      slotTime: formatTimeCell(r[5]),
      durationMin: Number(r[6]) || 0,
      price: Number(r[7]) || 0,
      name: String(r[8] || ""),
      phone: String(r[9] || "").replace(/^'/, ""),
      email: String(r[10] || ""),
      status: String(r[11] || "confirmed").trim().toLowerCase(),
      source: String(r[12] || "website").trim().toLowerCase(),
    });
  }
  return { bookings: out };
}

function formatDateTimeCell(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TIMEZONE, "yyyy-MM-dd HH:mm:ss");
  return String(v || "").trim();
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function sheet(name) {
  const ss = SpreadsheetApp.getActive();
  const s = ss.getSheetByName(name);
  if (!s) throw new Error("Missing tab: " + name);
  return s;
}

function readConfig() {
  const rows = sheet(TAB_CONFIG).getDataRange().getValues();
  const out = {};
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    const sport = String(r[0] || "").trim();
    if (!sport) continue;
    out[sport] = {
      openTime: formatTimeCell(r[1]),
      closeTime: formatTimeCell(r[2]),
      slotDurationMin: Number(r[3]) || 60,
      courtCount: Number(r[4]) || 1,
      price: Number(r[5]) || 0,
    };
  }
  return out;
}

function readBlockedSet(sport, dateStr) {
  const rows = sheet(TAB_BLOCKED).getDataRange().getValues();
  const set = {};
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    const d = formatDateCell(r[0]);
    const sp = String(r[1] || "").trim();
    const t = formatTimeCell(r[2]);
    if (d === dateStr && (sp === sport || sp === "*")) set[t] = true;
  }
  return set;
}

function countBookingsByTime(sport, dateStr) {
  const rows = sheet(TAB_BOOKINGS).getDataRange().getValues();
  // header columns: booking_id|created_at|sport|sport_name|date|slot_time|...|status
  const out = {};
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (String(r[2]).trim() !== sport) continue;
    if (formatDateCell(r[4]) !== dateStr) continue;
    const status = String(r[11] || "").trim().toLowerCase();
    if (status === "cancelled" || status === "no_show") continue;
    const t = formatTimeCell(r[5]);
    out[t] = (out[t] || 0) + 1;
  }
  return out;
}

function generateHourlySlots(open, close) {
  const oh = parseInt(open.split(":")[0], 10);
  const ch = parseInt(close.split(":")[0], 10);
  const out = [];
  for (var h = oh; h < ch; h++) {
    out.push((h < 10 ? "0" + h : h) + ":00");
  }
  return out;
}

function formatTimeCell(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TIMEZONE, "HH:mm");
  return String(v || "").trim();
}

function formatDateCell(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TIMEZONE, "yyyy-MM-dd");
  return String(v || "").trim();
}

function jsonResp(obj, status) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
