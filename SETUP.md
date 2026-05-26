# SETUP.md — Step-by-step deploy guide

> Read **UNDERSTAND.md** first if you haven't. This file is purely operational.

You'll do six things, in order:
1. Install Node + clone the repo.
2. Create the Google Sheet + paste the Apps Script.
3. Deploy the Apps Script as a Web App, get its URL.
4. Run the site locally to verify.
5. Push to GitHub and deploy to Vercel.
6. (Later) Wire up the WhatsApp bot.

Plan ~45 minutes for steps 1–5. Step 6 takes another 1–2 hours and needs a Meta Business account.

---

## 1. Install & clone

You need **Node.js 20+** and **git**.

```bash
git clone https://github.com/mraigeneralist/playfactory-website.git
cd playfactory-website/web
npm install
```

---

## 2. Create the Google Sheet

1. Go to <https://sheets.google.com> → blank spreadsheet.
2. Rename it **"PlayFactory Bookings"**.
3. Rename the default `Sheet1` tab to **`Bookings`** and paste this as row 1:
   ```
   booking_id	created_at	sport	sport_name	date	slot_time	duration_min	price	name	phone	email	status	source
   ```
4. Add a new tab called **`Config`** and paste this as row 1:
   ```
   sport	open_time	close_time	slot_duration_min	court_count	price
   ```
   Then fill these rows (or your real values):
   ```
   badminton-court	06:00	23:00	60	4	400
   badminton-guest	06:00	23:00	60	8	150
   cricket-turf	06:00	23:00	60	1	1200
   tt-court	06:00	23:00	60	2	250
   tt-guest	06:00	23:00	60	4	100
   ```
5. Add a tab called **`Blocked`** with row 1:
   ```
   date	sport	slot_time	reason
   ```
   Leave it empty for now. You can add rows like `2026-06-01 | badminton-court | 19:00 | Tournament` whenever you need to block a slot.

---

## 3. Deploy the Apps Script Web App

1. From the Sheet: **Extensions → Apps Script**. A new tab opens with `Code.gs`.
2. Open `apps-script/Code.gs` from this repo. **Replace** the contents of the Apps Script editor with the entire file.
3. Find this line near the top:
   ```js
   const SECRET = "REPLACE_WITH_LONG_RANDOM_STRING";
   ```
   Replace `REPLACE_WITH_LONG_RANDOM_STRING` with a long random string. You can generate one with:
   ```bash
   # macOS / Linux
   openssl rand -hex 24
   # Windows PowerShell
   [Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
   ```
   **Save this value** — you'll paste it into `.env.local` next.
4. Click **Save** (💾 icon).
5. Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" → choose **Web app**.
   - Description: `PlayFactory backend v1`
   - Execute as: **Me** (your account)
   - Who has access: **Anyone**
   - Click **Deploy**.
6. Authorize when prompted (Google warns it's an unverified app — click *Advanced* → *Go to (your project name)* → *Allow*).
7. Copy the **Web app URL** (ends in `/exec`). Save this too.

> Whenever you change `Code.gs` later: **Deploy → Manage deployments → pencil icon → New version → Deploy**. The URL doesn't change.

---

## 4. Run locally and test a booking

```bash
cd web
cp .env.example .env.local
```

Open `web/.env.local` and fill:
```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfy.../exec
SHEETS_WEBHOOK_SECRET=<the random string you put in Code.gs>
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210

# Admin dashboard at /admin
ADMIN_PASSWORD=<pick a strong password the owner will use to sign in>
SESSION_SECRET=<run: openssl rand -hex 32>
```

> Also edit the top of `apps-script/Code.gs` and set `OWNER_EMAIL`, `BUSINESS_NAME`, `BUSINESS_ADDRESS`, and `BUSINESS_PHONE` so email notifications go to the right inbox with the right details.

Then:
```bash
npm run dev
```

Open <http://localhost:3000>.

**Test checklist:**
- Home page loads with the green theme and animations.
- Click "Book a Slot" → pick badminton → pick today → pick a slot → fill name + phone → confirm.
- A new row appears in your `Bookings` sheet.
- Refresh `/book?sport=badminton-court` and pick the same date → the slot you booked should show one fewer "left" (or grey out if courts=1).
- Add a row to `Blocked`: `<today> | badminton-court | 19:00 | test` → refresh → the 7pm slot greys out.

If any of that fails, check the browser console + the terminal for errors. Most issues are a typo'd `SECRET` or an unsaved Apps Script change.

---

## 5. Push to GitHub and deploy to Vercel

> The user already created the repo at <https://github.com/mraigeneralist/playfactory-website.git>.

```bash
# From the repo root (not /web)
cd ..   # if you're inside /web
git init
git remote add origin https://github.com/mraigeneralist/playfactory-website.git
git add .
git commit -m "Initial PlayFactory website + WhatsApp bot scaffold"
git branch -M main
git push -u origin main
```

Then on Vercel:
1. <https://vercel.com/new> → **Import Git Repository** → pick `playfactory-website`.
2. **Root Directory**: click **Edit** → select `web` (important — the Next.js app is inside `/web`, not at the repo root).
3. Framework Preset: **Next.js** (auto-detected).
4. **Environment Variables** — add:
   - `SHEETS_WEBHOOK_URL` = (your `/exec` URL)
   - `SHEETS_WEBHOOK_SECRET` = (same long random string)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = `919876543210` (your real number)
   - `ADMIN_PASSWORD` = the owner's admin password
   - `SESSION_SECRET` = a long random string (different from `SHEETS_WEBHOOK_SECRET`)
5. Click **Deploy**. Wait ~2 minutes.
6. Test a booking on the live URL.
7. Visit `https://your-vercel-url/admin/login`, sign in with `ADMIN_PASSWORD`, and confirm you see the dashboard with the test booking you just made.

> Email notifications: the first time a booking lands, Apps Script will ask you (the script owner) to authorize the `MailApp` scope. Open the Apps Script editor → Run any function once → grant permission. After that, emails fire automatically. Email is sent from the Gmail account that owns the script and counts against your daily Gmail quota (1500/day for personal accounts — way more than PlayFactory will hit).

**Custom domain**: Vercel → Project Settings → Domains → add `playfactory.in` (or whatever) and follow the DNS instructions.

---

## 6. (Later) Wire up the WhatsApp bot

This is independent of the website. The website works fine without it. Activate when you're ready to chase the WhatsApp use case.

You'll need:
- A **Meta Business** account (free, but requires phone verification): <https://business.facebook.com>
- A **WhatsApp Business** phone number you can dedicate (separate from your personal WhatsApp).
- **Vercel** for the bot itself (second project on the same repo, Root Directory = `whatsapp-bot`).
- **cron-job.org** (free) to hit `/cron/reminders` every 5 minutes — same setup you used for RoadRunners.

Steps:

1. **Generate RSA keypair** (one-time, for Flow encryption):
   ```bash
   openssl genrsa -out flow_private_key.pem 2048
   openssl rsa -in flow_private_key.pem -pubout -out flow_public_key.pem
   ```
   Keep the private key file. Never commit it.

2. **Meta Business onboarding** — follow Meta's guide. At the end you'll have:
   - `WHATSAPP_TOKEN` (long-lived access token)
   - `PHONE_NUMBER_ID`
   - `META_APP_SECRET`

3. **Upload the Flow** to Meta:
   - Meta Business → WhatsApp → Flows → Create Flow.
   - Upload `whatsapp-bot/flows/booking_flow.json`.
   - Publish. Note the **Flow ID** → put in `FLOW_ID_BOOKING`.
   - Upload your `flow_public_key.pem` to the WhatsApp Business Account settings.

4. **Deploy the bot to Vercel** as a second project:
   - <https://vercel.com/new> → import the same `playfactory-website` repo.
   - **Root Directory** → `whatsapp-bot` (not `web`).
   - Framework Preset: **Other**. Vercel auto-detects Python via `requirements.txt`.
   - Add env vars from `.env.example` (everything you collected in steps 1–3).
   - **Important**: set `RUN_IN_PROCESS_SCHEDULER=0`. Vercel serverless can't run a long-lived APScheduler — the external cron handles reminders instead.
   - Deploy. You'll get a URL like `playfactory-bot.vercel.app`.

5. **Webhook**: in Meta → WhatsApp config, set webhook to `https://playfactory-bot.vercel.app/webhook`, paste your `VERIFY_TOKEN`, subscribe to `messages`.

6. **Set up reminders via cron-job.org** (same pattern as RoadRunners):
   - <https://cron-job.org> → Create cronjob.
   - URL: `https://playfactory-bot.vercel.app/cron/reminders`
   - Schedule: every 5 minutes
   - Method: **POST**
   - Headers: add `Authorization: Bearer <your CRON_SECRET>`
   - Save & enable. Check the execution log after a few minutes to confirm 200 responses.

7. **Test**: text "hi" to your business number. The bot should reply with the booking link. Tap the Flow button (you'll wire that into the welcome reply) to start a booking — it should write a row to the same Google Sheet as the website.

> The reminders feature also expects an `action=bookings_today` endpoint in `Code.gs` that isn't built yet. Either add one (small change — filter `Bookings` rows where `date == today`) or migrate to Supabase first per `UNDERSTAND.md`.

---

## Troubleshooting

**"Sheets backend not configured" on the booking page**
You forgot to set `SHEETS_WEBHOOK_URL` / `SHEETS_WEBHOOK_SECRET` in `.env.local` (locally) or in Vercel (production). Restart `npm run dev` after editing `.env.local`.

**Booking POST returns "Unauthorized"**
The `SECRET` in `Code.gs` doesn't match `SHEETS_WEBHOOK_SECRET` in your env. Fix and redeploy the Apps Script (Manage deployments → New version).

**Slot grid is always full / never updates**
You changed the Sheet but didn't refresh the page, OR you edited `Code.gs` but didn't redeploy. The deployed version is a snapshot — code changes need a new deployment.

**Vercel build fails with "Cannot find module"**
You forgot to set Root Directory to `web` in Vercel project settings.

**`npm run dev` works but live site shows old data**
Vercel caches — trigger a fresh deploy or push an empty commit.
