"""Thin async client around the WhatsApp Cloud API."""
from __future__ import annotations

import logging
import httpx

from .config import settings

log = logging.getLogger(__name__)
GRAPH = "https://graph.facebook.com/v20.0"


async def send_text(to: str, text: str) -> dict:
    if not settings.WHATSAPP_TOKEN or not settings.PHONE_NUMBER_ID:
        log.warning("[whatsapp] not configured; would have sent to %s: %s", to, text)
        return {"skipped": True}
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text},
    }
    async with httpx.AsyncClient(timeout=10.0) as c:
        r = await c.post(
            f"{GRAPH}/{settings.PHONE_NUMBER_ID}/messages",
            headers={"Authorization": f"Bearer {settings.WHATSAPP_TOKEN}"},
            json=payload,
        )
    if r.status_code >= 400:
        log.error("[whatsapp] send failed %s %s", r.status_code, r.text)
    return r.json()


async def send_flow_button(to: str, body: str, flow_id: str, cta: str = "Book a slot") -> dict:
    """Open a WhatsApp Flow from a button — call this from the menu handler."""
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "flow",
            "body": {"text": body},
            "action": {
                "name": "flow",
                "parameters": {
                    "flow_message_version": "3",
                    "flow_id": flow_id,
                    "flow_cta": cta,
                    "flow_action": "navigate",
                    "flow_action_payload": {"screen": "SPORT", "data": {}},
                },
            },
        },
    }
    async with httpx.AsyncClient(timeout=10.0) as c:
        r = await c.post(
            f"{GRAPH}/{settings.PHONE_NUMBER_ID}/messages",
            headers={"Authorization": f"Bearer {settings.WHATSAPP_TOKEN}"},
            json=payload,
        )
    return r.json()
