# CLAUDE.md — Guidance for future Claude sessions on this repo

## Project shape

Three workspaces, no monorepo tooling. Treat them as independent.

```
web/             Next.js 16 App Router site (TypeScript, Tailwind 4)
apps-script/     Google Apps Script (single Code.gs) — the backend
whatsapp-bot/    Python FastAPI scaffold — not wired yet
```

## Web app conventions

- **Single source of truth for content & pricing**: `web/lib/constants.ts`. Sports, coaching programs, memberships, business contact details, and all `TODO:`-marked placeholders live here. Every page renders from these arrays — never hardcode another menu item.
- **App Router**: pages are in `web/app/<route>/page.tsx`. Each page composes section components from `web/components/landing/*` or step components from `web/components/booking/*`.
- **Styling**: green-and-white via CSS vars in `web/app/globals.css` (`--primary` etc.). Use Tailwind utility classes referencing the custom theme tokens (`bg-primary`, `text-ink`, `border-border`, etc.). Reach for the `gradient-text` and `shadow-soft` / `shadow-rich` helpers for the "rich" feel.
- **Fonts**: Poppins headings (`var(--font-poppins)`), Inter body — loaded once in `app/layout.tsx`.
- **Animations**: `ScrollReveal` component fades sections in on intersection. `au1`/`au2`/`au3`/`au4` classes stagger the hero entrance.
- **No images yet**: gallery and hero use gradient + emoji placeholders. When real photos arrive: drop into `web/public/gallery/*` and swap `<div>` tiles for `<Image>`.

## Booking flow

`web/app/book/page.tsx` is a 5-step state machine: Sport → Date → Slot → Details → Done. State persists to `sessionStorage` under key `pf-booking`. Two API routes mediate to the Sheets backend:

- `GET /api/booking/slots?sport=…&date=…` → `web/app/api/booking/slots/route.ts` → `lib/sheets.ts#fetchSlots` → Apps Script `?action=slots`.
- `POST /api/booking` → `web/app/api/booking/route.ts` (zod validation + price re-check) → `lib/sheets.ts#createBooking` → Apps Script `doPost`.

If the Sheets backend is unreachable, the slots endpoint **falls back to "all open"** so dev still works without env config — see the `try/catch` in `slots/route.ts`. The booking POST does not fall back; it errors clearly.

## Apps Script backend

`apps-script/Code.gs` is the entire backend. Three tabs:
- **Bookings** — append-only log; capacity is computed by counting rows where `status` is not `cancelled` / `no_show`.
- **Config** — operating hours, slot duration, court count, price per sport. The web `SPORTS` array must stay in sync.
- **Blocked** — owner manually adds rows here to mark slots unavailable.

`LockService` serializes booking writes within a script instance — sufficient for this scale. The shared secret is sent in the request body (`_secret`) because Apps Script doPost cannot read custom headers reliably.

## WhatsApp bot

Scaffold only. `whatsapp-bot/main.py` boots and exposes routes but Meta credentials are empty. Activation steps live in `whatsapp-bot/README.md` and `SETUP.md` step 6. Hot spots to know:
- `bot/flow_endpoint.py` handles the AES-GCM encrypted Flow data exchange.
- `bot/reminders.py` expects an `action=bookings_today` endpoint in `Code.gs` that isn't built yet — add it before enabling reminders, or migrate to Supabase first.
- `flows/booking_flow.json` is the Flow definition Meta needs.

## Common tasks

### Adding a new sport
1. Add an entry to `SPORTS` in `web/lib/constants.ts`.
2. Add a matching row to the `Config` tab of the live Google Sheet.
3. (Optional) Add to `SPORTS_FOR_FLOW` in `whatsapp-bot/bot/flow_endpoint.py`.

### Changing prices / business details
Edit `web/lib/constants.ts`. Push, deploy. Update the Sheet's `Config.price` column too if booking price changed.

### Adding a coaching program
Edit the `COACHING` array in `web/lib/constants.ts`. The coaching page groups by category automatically.

### Local testing without Sheets
`npm run dev` still works — slots are shown as all-open and booking POSTs will fail with a clear "Sheets backend not configured" message. Set `SHEETS_WEBHOOK_URL` + `SHEETS_WEBHOOK_SECRET` in `.env.local` to test the full path.

## What NOT to do

- Don't add OTP / phone verification yet — the Sheets backend can't store transient state cleanly. Wait for the Supabase migration.
- Don't introduce a payments integration — the spec is pay-on-arrival.
- Don't add an admin dashboard inside the Next.js app. The owner manages everything via the Google Sheet directly.
- Don't switch `SPORTS` to load from the Sheet at runtime. The website's constant-file approach gives instant page loads and lets the marketing copy reference prices server-side without an API call.
