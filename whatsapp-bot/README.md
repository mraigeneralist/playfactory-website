# PlayFactory WhatsApp Bot — SCAFFOLD

> Status: **Not yet wired.** Code is in place; Meta credentials and Flow upload still need to happen.
> See the project's `SETUP.md` step 6 for the activation walkthrough.

## What it does (when activated)
- Customers chat the business number → bot opens a WhatsApp Flow → they pick sport / date / slot / give name+phone → booking lands in the same Google Sheet the website uses.
- A cron job (every 5 min) sends slot reminders 1 hour, 30 min and 10 min before a confirmed slot.

## Local dev
```bash
cd whatsapp-bot
python -m venv .venv && . .venv/Scripts/activate   # Windows
pip install -r requirements.txt
cp .env.example .env  # then fill values
uvicorn main:app --reload
```
Hit `http://localhost:8000/health` — should return `{"ok": true, ...}`.

## Endpoints
- `GET /webhook` — Meta webhook verification challenge
- `POST /webhook` — incoming messages
- `POST /flow` — encrypted Flow data exchange (decrypts, routes, re-encrypts)
- `POST /cron/reminders` — reminder sweep (requires `Authorization: Bearer $CRON_SECRET`)

## Activating (high-level)
1. Generate an RSA keypair (Meta requires 2048-bit) → upload public key to Meta → put private key in `FLOW_PRIVATE_KEY`.
2. Create a WhatsApp app + business in Meta. Grab `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, `META_APP_SECRET`.
3. In Meta Flow Builder, upload `flows/booking_flow.json` → get `FLOW_ID_BOOKING`.
4. Deploy this app (Render / Fly / Railway recommended for the background scheduler; Vercel works too with Vercel Cron hitting `/cron/reminders`).
5. Add the webhook URL `https://your-host/webhook` to Meta → subscribe to `messages`.
6. Test by texting "hi" to the business number.
