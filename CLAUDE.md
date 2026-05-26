# CLAUDE.md — Guidance for future Claude sessions on this repo

## Project shape

Three workspaces, no monorepo tooling. Treat them as independent.

```
web/                Next.js 16 App Router site (TypeScript, Tailwind 4)
supabase/           SQL migrations for the Supabase project
apps-script/        Google Apps Script — email-only worker (no DB role)
whatsapp-bot/       Python FastAPI scaffold — not wired yet
```

## Backend architecture (post-Supabase migration)

**Supabase Postgres is the source of truth.** Four tables:
- `sports` — courts catalogue (id, name, price, open/close, court count). Anyone can read.
- `blocked_slots` — owner-managed closures. Anyone can read.
- `bookings` — append-only log. RLS: customers see only their own; service role bypasses for admin.
- `profiles` — extends `auth.users` with `name` + `phone`. Auto-created via DB trigger on signup.

**Supabase Auth** handles signup/login (email + password). Sessions live in HTTP-only cookies via `@supabase/ssr`.

**Apps Script** is no longer a database. It's a single-purpose webhook (`action=send_emails`) that sends owner + customer emails via MailApp. Next.js POSTs to it after every booking insert, fire-and-forget.

## Web app conventions

- **Source of truth for site content** (sports list shown in the UI, coaching catalog, memberships, business contact) is `web/lib/constants.ts`. **The `SPORTS` array there MUST stay in sync with the `sports` table in Supabase.** Add a sport → seed it in both places. The server re-validates sport+price against the DB on booking POST, so mismatches surface clearly.
- **App Router** — pages in `web/app/<route>/page.tsx`. Auth-required routes (`/book`, `/account`, `/admin`) are enforced in `web/proxy.ts` (Next.js 16's "proxy" convention, formerly `middleware.ts`).
- **Styling**: green-and-white via CSS vars in `web/app/globals.css`. Tailwind tokens like `bg-primary`, `text-ink`, `border-border` come from `@theme inline { … }`.
- **Three Supabase clients**, all in `web/lib/supabase/`:
  - `browser.ts` — for client components.
  - `server.ts` — for server components, route handlers, the proxy. Uses cookies.
  - `service.ts` — bypasses RLS, server-only, NEVER imported from anything that runs in the browser.
- **Data layer**: `web/lib/db.ts` (replaces the old `sheets.ts`). All Supabase reads/writes go through here.

## Booking flow

`web/app/book/page.tsx` — 5-step state machine: Sport → Date → Slot → Details → Done. State persists to `sessionStorage` under `pf-booking`. On mount: fetches the user's profile and prefills name/phone/email so repeat customers don't retype.

API routes:
- `GET /api/booking/slots?sport=…&date=…` → `lib/db.ts#fetchSlots` → reads `sports`, counts `bookings`, checks `blocked_slots`.
- `POST /api/booking` → zod-validates, re-checks price + capacity, INSERTs into `bookings`, fires email webhook in the background.

## Account & admin

### `/account` (`app/account/page.tsx` + `AccountClient.tsx`)
Customer-facing. Tabs: Upcoming bookings, Past bookings, Profile editing. Uses `fetchMyBookings()` which relies on RLS to scope results to the current `auth.uid()`.

### `/admin` (`app/admin/page.tsx`)
Owner-facing. Stats cards, recharts charts, full bookings table with **inline status dropdown** to flip bookings to cancelled / completed / no-show. Reads via service role (`fetchAllBookings`); writes via `PATCH /api/admin/bookings`.

Access is gated by `ADMIN_EMAIL` env — the proxy checks the logged-in user's email matches.

## Apps Script email worker

`apps-script/Code.gs` only exports `doGet` (health) and `doPost(action=send_emails)`. Auth via `_secret` in the body (Apps Script can't read custom headers). Wrapped in try/catch — email failure logs but doesn't fail the response.

Owner: `OWNER_EMAIL` constant at top of `Code.gs`. Customer: only if `b.email` is non-empty (it always is now, since the form requires email).

## WhatsApp bot

Scaffold only. `whatsapp-bot/main.py` boots and exposes routes but Meta credentials are empty. When activated, `bot/sheets.py` should be rewritten to `bot/db.py` using the Supabase Python client + service role key — it can then write to the same `bookings` table.

## Common tasks

### Adding a new sport
1. Insert a row in Supabase `sports` (Table Editor or SQL).
2. Add an entry to `SPORTS` in `web/lib/constants.ts` matching the same `id` + `price_inr`.

### Changing prices
1. Update Supabase `sports.price_inr` for the affected row.
2. Update the matching entry in `web/lib/constants.ts` so the UI shows the new price before the server re-validates.

### Blocking a slot
Supabase → `blocked_slots` → Insert row. No deploy needed.

### Making someone the owner
Set `ADMIN_EMAIL` env to their email. They sign up via `/signup` with that email. Done.

## What NOT to do

- Don't reintroduce a Sheets-based data path. Apps Script is email-only now.
- Don't bypass RLS by using the service-role client from a browser-facing component. Always: browser → API route → service client.
- Don't store the service role key in `NEXT_PUBLIC_*` (it's prefix-only protected by convention; the actual leak is your fault if you do this).
- Don't add payment processing — the spec is pay-on-arrival.
- Don't add a separate password-reset flow; Supabase Auth already provides one via the dashboard — link from the login page when needed.

## Things that are intentionally NOT here yet

- Password reset UI (Supabase has the backend; UI not built — easy add)
- "Cancel my booking" button on `/account` (RLS already allows it; UI not built)
- Email change in profile (intentionally disabled — Supabase email change is a multi-step flow with verification; deferred)
- WhatsApp wiring (separate session)
