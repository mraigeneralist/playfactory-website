"""Vercel serverless: /api/cron/reminders

Triggered every 5 min by cron-job.org (or any external cron) with:
    Authorization: Bearer <CRON_SECRET>

Fail-closed: if CRON_SECRET isn't set or header doesn't match, returns 503.
"""
from fastapi import FastAPI, Header, HTTPException

from bot.config import settings
from bot.reminders import scan_and_send_reminders

app = FastAPI()


@app.post("/")
@app.post("/cron/reminders")
async def reminders(authorization: str | None = Header(default=None)):
    expected = f"Bearer {settings.CRON_SECRET}"
    if not settings.CRON_SECRET or authorization != expected:
        raise HTTPException(status_code=503, detail="cron not configured")
    sent = await scan_and_send_reminders()
    return {"sent": sent}
