"""Python client for the Apps Script webhook — mirrors web/lib/sheets.ts."""
from __future__ import annotations

import httpx

from .config import settings


async def fetch_slots(sport: str, date: str) -> list[dict]:
    if not settings.SHEETS_WEBHOOK_URL:
        return []
    url = f"{settings.SHEETS_WEBHOOK_URL}?action=slots&sport={sport}&date={date}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        data = r.json()
    return data.get("slots", []) or []


async def create_booking(payload: dict) -> dict:
    if not settings.SHEETS_WEBHOOK_URL or not settings.SHEETS_WEBHOOK_SECRET:
        return {"success": False, "error": "Sheets backend not configured"}
    body = {"action": "book", "_secret": settings.SHEETS_WEBHOOK_SECRET, **payload}
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(settings.SHEETS_WEBHOOK_URL, json=body)
    return r.json()


async def fetch_bookings_today() -> list[dict]:
    """For reminders. Add a 'bookings_today' action to Code.gs to support this."""
    if not settings.SHEETS_WEBHOOK_URL:
        return []
    url = f"{settings.SHEETS_WEBHOOK_URL}?action=bookings_today"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
        return data.get("bookings", []) or []
    except Exception:
        return []
