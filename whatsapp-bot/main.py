"""PlayFactory WhatsApp booking bot — FastAPI entry point.

This is a SCAFFOLD. It boots, exposes /health, and wires up routes for the
WhatsApp webhook, Flow data exchange, and reminder cron. The handlers contain
TODOs where Meta credentials and message templates need to be filled in.

Run locally:
    pip install -r requirements.txt
    cp .env.example .env  &&  edit .env
    uvicorn main:app --reload
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.responses import PlainTextResponse, JSONResponse

from bot.config import settings
from bot.reminders import scan_and_send_reminders
from bot.flow_endpoint import handle_flow_request
from bot.whatsapp import send_text

log = logging.getLogger("playfactory.bot")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


@asynccontextmanager
async def lifespan(_: FastAPI):
    log.info("PlayFactory bot starting. business=%s", settings.BUSINESS_NAME)
    # APScheduler is optional — if you deploy on Vercel use the cron endpoint
    # instead. Locally / on Render we run an in-process scheduler.
    scheduler = None
    if settings.RUN_IN_PROCESS_SCHEDULER:
        try:
            from apscheduler.schedulers.asyncio import AsyncIOScheduler
            scheduler = AsyncIOScheduler()
            scheduler.add_job(scan_and_send_reminders, "interval", minutes=5)
            scheduler.start()
            log.info("In-process reminder scheduler started (every 5 min)")
        except Exception as e:
            log.warning("Scheduler failed to start: %s", e)
    yield
    if scheduler:
        scheduler.shutdown()


app = FastAPI(title="PlayFactory WhatsApp Bot", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"ok": True, "business": settings.BUSINESS_NAME}


# ─── WhatsApp webhook verification (GET) ─────────────────────────────────────
@app.get("/webhook")
async def webhook_verify(request: Request):
    params = dict(request.query_params)
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge", "")
    if mode == "subscribe" and token == settings.VERIFY_TOKEN:
        return PlainTextResponse(challenge)
    raise HTTPException(status_code=403, detail="verification failed")


# ─── WhatsApp message webhook (POST) ─────────────────────────────────────────
@app.post("/webhook")
async def webhook_message(request: Request):
    body = await request.json()
    log.info("webhook payload: %s", body)

    # TODO: validate X-Hub-Signature-256 using META_APP_SECRET
    # TODO: route incoming text/button/flow-completion messages to handlers
    # For now, just echo "Hi" with a helpful onboarding message.
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


# ─── Flow data-exchange endpoint (encrypted) ─────────────────────────────────
@app.post("/flow")
async def flow(request: Request):
    body = await request.json()
    return await handle_flow_request(body)


# ─── Reminder cron (for Vercel Cron or external scheduler) ───────────────────
@app.post("/cron/reminders")
async def cron_reminders(authorization: str | None = Header(default=None)):
    expected = f"Bearer {settings.CRON_SECRET}"
    if not settings.CRON_SECRET or authorization != expected:
        raise HTTPException(status_code=503, detail="cron not configured")
    sent = await scan_and_send_reminders()
    return {"sent": sent}
