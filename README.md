# PlayFactory

Booking + marketing site for **PlayFactory**, a Chennai sports facility offering badminton/cricket/TT court rentals, coaching programs, and memberships.

## Stack
- **Web:** Next.js 16 + React 19 + Tailwind 4 (`/web`)
- **Backend:** Google Sheet + Apps Script Web App (`/apps-script`)
- **WhatsApp bot:** FastAPI scaffold (`/whatsapp-bot`)

## Quick start
```bash
cd web
npm install
cp .env.example .env.local   # fill SHEETS_WEBHOOK_URL + SECRET
npm run dev
```

Open <http://localhost:3000>.

## Docs
- **[SETUP.md](./SETUP.md)** — step-by-step deploy guide (start here)
- **[UNDERSTAND.md](./UNDERSTAND.md)** — architecture, data flow, why these choices
- **[CLAUDE.md](./CLAUDE.md)** — guidance for future Claude sessions on this repo

## Repo map
```
web/             Next.js site (Vercel target)
apps-script/     Google Apps Script — paste into the script editor
whatsapp-bot/    Python FastAPI scaffold (activate later)
```
