"""Vercel serverless: /api/webhook

GET  — Meta webhook verification
POST — Incoming messages

Vercel strips the file path when routing to the ASGI app, so we register
routes at both "/" (Vercel) and "/webhook" (local uvicorn) for symmetry.
"""
import logging

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse, PlainTextResponse

from bot.config import settings
from bot.whatsapp import send_text

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger(__name__)

app = FastAPI()


@app.get("/")
@app.get("/webhook")
async def verify(
    hub_mode: str = Query(alias="hub.mode", default=""),
    hub_challenge: str = Query(alias="hub.challenge", default=""),
    hub_verify_token: str = Query(alias="hub.verify_token", default=""),
) -> PlainTextResponse:
    if hub_mode == "subscribe" and hub_verify_token == settings.VERIFY_TOKEN:
        return PlainTextResponse(hub_challenge)
    raise HTTPException(status_code=403, detail="Forbidden")


@app.post("/")
@app.post("/webhook")
async def message(request: Request):
    body = await request.json()
    log.info("webhook payload: %s", body)
    try:
        entry = body.get("entry", [])[0]
        change = entry.get("changes", [])[0]
        value = change.get("value", {})
        messages = value.get("messages") or []
        if messages:
            msg = messages[0]
            sender = msg.get("from")
            text = (msg.get("text") or {}).get("body", "").strip().lower()
            if text in {"hi", "hello", "book", "menu"}:
                await send_text(
                    sender,
                    f"Hi! Welcome to {settings.BUSINESS_NAME}. "
                    f"Book a court here: {settings.WEBSITE_URL}/book\n"
                    "Or reply with the sport (e.g. 'badminton', 'cricket', 'tt').",
                )
    except Exception as e:
        log.exception("webhook handler failed: %s", e)
    return JSONResponse({"ok": True})
