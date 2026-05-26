# UNDERSTAND.md — How the PlayFactory project works

> Read this once end-to-end. After that, **SETUP.md** has the click-by-click instructions.

## What you're getting

| Piece | Lives in | Status | Purpose |
|---|---|---|---|
| **Website** | `web/` | Done — deploy & go | Marketing pages + customer accounts + online slot booking + owner dashboard |
| **Database + Auth** | Supabase project | Done — run the SQL once | All bookings, sports config, blocked slots, customer profiles, login/signup |
| **Email worker** | `apps-script/Code.gs` | Done — paste & deploy | Sends the two booking-confirmation emails on every booking |
| **WhatsApp bot** | `whatsapp-bot/` | Scaffolded, not wired | Customers book by chatting; auto reminder messages |

---

## Tech choices

| Layer | Pick | Reason |
|---|---|---|
| Frontend | Next.js 16 + Tailwind 4 | Fast, modern, easy Vercel deploys |
| Data | Supabase Postgres | Real DB with auth, RLS, free tier; trivial migration path off Sheets |
| Auth | Supabase Auth (email + password) | Sessions, hashing, password reset — all free, all standard |
| Email | Apps Script + Gmail | Free, no third-party email service to maintain. Apps Script is just a "send these 2 emails" worker |
| Hosting | Vercel | One-click deploys, free tier sufficient |
| WhatsApp bot | FastAPI on Vercel + cron-job.org | Same pattern as RoadRunners |

---

## How a booking flows end-to-end

```
[Customer browser]
       │ Goes to /book
       ▼
[Next.js proxy.ts]  ── checks Supabase session
       │ Not signed in? → redirect to /login
       ▼
[/book page]  ── prefills name + phone + email from profiles row
       │ Customer picks sport → date → slot → confirms
       │ POST /api/booking
       ▼
[/api/booking]  ── zod-validates payload
       │ Calls createBooking() in lib/db.ts
       ▼
[Supabase]
       ├─ Re-validates sport + price against `sports` table
       ├─ Counts existing confirmed bookings for that slot
       ├─ Checks `blocked_slots`
       ├─ INSERT into `bookings` (user_id = auth.uid via RLS)
       │
[/api/booking]  ── fires sendBookingEmails() (don't await)
       │ POST to Apps Script with action=send_emails
       ▼
[Apps Script]  ── sends owner email + customer email via MailApp
       │
[Customer browser]  ── confirmation screen with booking ID
```

---

## Folder-by-folder

### `web/` — Next.js site
- **`app/`** — pages and API routes (App Router).
  - `page.tsx` — landing.
  - `book/page.tsx` — 5-step booking flow; requires Supabase session.
  - `login/`, `signup/` — Supabase Auth sign-in/sign-up flows.
  - `auth/callback/route.ts` — Supabase magic-link / email-confirm landing.
  - `account/` — customer profile + booking history (upcoming + past tabs).
  - `admin/` — owner dashboard (stats, charts, full bookings table with status mutations).
  - `api/booking/` — slot availability + booking create.
  - `api/admin/bookings/` — GET (list all) + PATCH (update status). Service role only.
  - `api/auth/logout/` — Supabase signOut.
- **`components/`**
  - `landing/` — home page sections.
  - `booking/` — the 5 step components + StepIndicator.
  - `account/`-style components live inline in `app/account/AccountClient.tsx`.
  - `admin/` — StatCard, Charts (recharts), BookingsTable.
  - `ui/` — ScrollReveal, WhatsAppFloat.
  - `auth/AuthShell.tsx` — shared layout for login/signup pages.
- **`lib/`**
  - `constants.ts` — site content (sports, coaching, memberships, business contact). Sports list MUST stay in sync with the `sports` table in Supabase. Edit both when adding/removing a sport.
  - `db.ts` — Supabase-backed data layer (slots, booking create, admin list, profile bookings). Replaces the old `sheets.ts`.
  - `email.ts` — POSTs booking details to Apps Script for email send.
  - `supabase/browser.ts`, `supabase/server.ts`, `supabase/service.ts` — three Supabase client flavours.
  - `slots.ts`, `types.ts` — pure helpers + shared types.
- **`proxy.ts`** — auth gate. Protects `/book`, `/account`, `/admin`. Admin requires email to match `ADMIN_EMAIL`.

### `apps-script/Code.gs`
The entire backend used to live here. Now it's just a webhook that receives `action=send_emails` and sends the two emails. No database role.

### `supabase/migrations/`
SQL migrations. Run them in the Supabase SQL Editor. The initial `0001_initial_schema.sql` creates everything.

### `whatsapp-bot/`
FastAPI scaffold. Not wired. Will eventually share the same Supabase tables (rewrite `bot/sheets.py` → `bot/db.py` pointing at Supabase).

---

## Supabase schema

### `sports`
PK = `id` (e.g. `badminton-court`). Has `price_inr`, `courts`, `open_time`, `close_time`, `is_active`, etc. Anyone can read; only service role writes.

### `blocked_slots`
Owner manually adds rows (Supabase Table Editor) to block a slot for maintenance / tournaments. `sport_id = NULL` blocks all sports for that time. Anyone can read.

### `bookings`
The booking log. `user_id` FK to `auth.users` ties each booking to the customer who made it. RLS:
- Customers can read **only** rows where `user_id = auth.uid()`
- Customers can insert bookings only with their own `user_id`
- Customers can cancel (update status to 'cancelled') their own bookings
- Service role (used by admin endpoints) bypasses RLS

### `profiles`
One row per `auth.users` row, auto-created by the `on_auth_user_created` trigger. Stores `name` + `phone`. Customer can read/update only their own.

---

## Auth model

- **Customers** sign up at `/signup` with email + password. Supabase Auth handles hashing, sessions, password reset emails. A row is auto-created in `profiles` via DB trigger.
- **Owner** signs up the same way, but the email they use must match `ADMIN_EMAIL` env. The proxy checks this on every `/admin/*` request.
- Sessions are HTTP-only cookies managed by `@supabase/ssr`. They refresh automatically.

---

## Admin dashboard & notifications

### Owner dashboard at `/admin`
- Today / month / all-time stat cards (bookings count + revenue)
- Revenue last 7 days bar chart
- Bookings-by-sport donut
- Next 5 upcoming slots
- Full searchable + filterable bookings table with **inline status dropdown** to mark bookings cancelled / completed / no-show. Writes go to Supabase via service role.

### Email notifications
Every successful booking insert kicks off a background `fetch()` to the Apps Script webhook, which sends:
1. **Owner email** at `OWNER_EMAIL` — sport, time, customer name + phone, price.
2. **Customer email** at the email field on the booking — branded confirmation with booking ID + address. (Email field is required, captured from the profile prefill.)

Failures are logged but never bubble back to the customer — the row is already saved.

---

## What happens when…

**…the customer hits /book without an account?**
Proxy redirects to `/login?next=/book`. After login, they bounce back to /book with name/phone/email auto-filled from their profile.

**…two customers try to book the same last slot?**
Both POSTs run a count query on `bookings` first. The first to finish gets the row; the second's count comes back equal to `sport.courts` and the response is "slot just got fully booked." Not 100% race-proof (no row-level lock), but Postgres is fast enough that for PlayFactory's scale it's effectively safe. If it ever becomes an issue, we can add an `EXCLUDE` constraint or a serializable transaction.

**…the owner wants to block tomorrow morning?**
Supabase → Table Editor → `blocked_slots` → Insert row(s). Booking page reflects instantly (no deploy).

**…you want to change a price?**
Two places, in this order:
1. Supabase → `sports` → update `price_inr`.
2. `web/lib/constants.ts` → update the matching `priceINR` (used by the booking UI to show price before the server confirms).

**…the Apps Script email worker is down?**
The booking still succeeds. The owner just doesn't get an email until you fix it. The customer also doesn't get one, but the on-screen confirmation tells them they're booked.

---

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` is the most sensitive value in the project — it bypasses RLS. Only `lib/supabase/service.ts` reads it, and that file is server-only. Never expose it to the browser.
- The shared secret between Next.js and Apps Script (`SHEETS_WEBHOOK_SECRET`) gates email sends. Rotate it by updating both `Code.gs` and Vercel env, then redeploying both.
- RLS policies enforce that customers can never see another customer's bookings or profile.
- `next.config.ts` ships strict CSP, HSTS, frame-ancestors=none.
- We don't store payment info — payment is on arrival.

---

## When you'll want help

- Photos / branding (we used emoji + gradient placeholders).
- Wiring real Meta credentials for the WhatsApp bot.
- Migrating the WhatsApp bot's data layer from the Apps Script bridge to Supabase directly.
- SMS notifications (Twilio / MSG91) if email isn't enough.
- Razorpay payments if you want to take advance payment.

Any of those — open a new conversation and reference this file.
