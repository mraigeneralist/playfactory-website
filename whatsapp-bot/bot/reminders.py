"""Send 1h / 30m / 10m reminders for today's confirmed bookings.

The Apps Script backend currently doesn't expose a "today's bookings" endpoint;
add one (action=bookings_today) before enabling reminders, OR switch to
Supabase per UNDERSTAND.md.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone, timedelta

from .config import settings
from .sheets import fetch_bookings_today
from .whatsapp import send_text

log = logging.getLogger(__name__)
IST = timezone(timedelta(hours=5, minutes=30))

WINDOWS = [
    (50, 65, "1 hour", "reminder_1h_sent"),
    (25, 35, "30 minutes", "reminder_30m_sent"),
    (5, 15, "10 minutes", "reminder_10m_sent"),
]


async def scan_and_send_reminders() -> int:
    sent_count = 0
    now = datetime.now(IST)
    bookings = await fetch_bookings_today()
    for b in bookings:
        if (b.get("status") or "").lower() != "confirmed":
            continue
        try:
            slot_dt = datetime.fromisoformat(f"{b['date']}T{b['slot_time']}:00").replace(tzinfo=IST)
        except Exception:
            continue
        mins_until = (slot_dt - now).total_seconds() / 60
        for lo, hi, label, flag in WINDOWS:
            if lo <= mins_until <= hi and not b.get(flag):
                msg = (
                    f"Reminder — {settings.BUSINESS_NAME}\n\n"
                    f"Hi {b.get('name','player')}, your {b.get('sport_name','slot')} is in {label}.\n"
                    f"{b['slot_time']} today.\n\n"
                    "Reply CANCEL to cancel."
                )
                await send_text(b.get("phone", ""), msg)
                sent_count += 1
                # TODO: flip the reminder flag back in the sheet to prevent duplicates
                break
    log.info("reminder scan complete: sent=%d", sent_count)
    return sent_count
