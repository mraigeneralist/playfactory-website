# SETUP.md — Step-by-step deploy guide

> Read **UNDERSTAND.md** first if you haven't. This file is purely operational.

You'll do six things, in order:
1. Install Node + clone the repo.
2. Create the Supabase project + run the schema SQL.
3. Set up the Apps Script email worker.
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

## 2. Create the Supabase project

1. Go to <https://supabase.com> → New project. Pick the **AP-South (Mumbai)** region for low latency to Indian users.
2. Save the database password somewhere safe (you won't need it for the app).
3. Project Settings → API. Copy three values:
   - **Project URL** (e.g. `https://abcxyz.supabase.co`)
   - **anon public key** (the one starting `eyJhbGciOiJI...` with `role: anon`)
   - **service_role key** (the other long one — keep secret, server-only)
4. **Disable email confirmation** so customers can book immediately after signing up: Project → Authentication → Sign In / Providers → Email → toggle **Confirm email** OFF, click Save. (You can turn it back on later if you want — it just adds a tap-the-link step before first login.)
5. **Run the schema**: SQL Editor → New query → paste the entire contents of `supabase/migrations/0001_initial_schema.sql` → click **Run**. You should see "Success. No rows returned."
   - This creates 4 tables (`sports`, `blocked_slots`, `bookings`, `profiles`), seeds the 5 sports, sets up Row-Level Security, and adds a trigger that auto-creates a profile when someone signs up.
   - Safe to re-run.

To edit prices or court counts later, either edit the `sports` table directly in the Supabase Table Editor, or edit the seed block in the migration file and re-run.

---

## 3. Apps Script email worker

Apps Script is no longer a database — its only job is to send the two booking emails (owner + customer).

1. Go to <https://script.google.com> → New project (or open the script attached to your old PlayFactory sheet).
2. Replace `Code.gs` with the contents of `apps-script/Code.gs` from this repo.
3. Edit the constants at the top:
   ```js
   const SECRET = "...";                            // any long random string
   const OWNER_EMAIL = "your.email@gmail.com";      // who gets owner notifications
   const BUSINESS_NAME = "PlayFactory";
   const BUSINESS_ADDRESS = "...";
   const BUSINESS_PHONE = "...";
   ```
   Save `SECRET` — you'll paste it into env as `SHEETS_WEBHOOK_SECRET`.
4. **Deploy → New deployment → Web app**, Execute as **Me**, Access **Anyone**, click Deploy. Authorize when prompted.
5. Copy the `/exec` URL.

The old `Bookings` / `Config` / `Blocked` tabs from the Google Sheet are no longer used. You can keep the sheet for historical reference or delete it.

---

## 4. Run locally and test

```bash
cd web
cp .env.example .env.local
```

Fill `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
SHEETS_WEBHOOK_SECRET=<the value you put in Code.gs SECRET>
ADMIN_EMAIL=your.email@gmail.com
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

> `ADMIN_EMAIL` is the email you'll sign up with that should get access to `/admin`. Anyone signing up with a different email is a regular customer.

Then:
```bash
npm run dev
```

Open <http://localhost:3000>.

**Test checklist:**
- Home page loads with green theme.
- Click "Sign in" → "Create an account" → fill name + phone + email + password → submit.
- You should land on `/account` (no email confirmation needed since you disabled it).
- Click "Book a Slot" → name + phone + email are pre-filled → pick sport → date → slot → confirm.
- Within 5 seconds: owner email + customer email arrive, a row appears in Supabase `bookings` table.
- Visit `/admin` (only works if you signed up with the email matching `ADMIN_EMAIL`) → see the booking in stats + table.

---

## 5. Push to GitHub and deploy to Vercel

```bash
# From the repo root (not /web)
git add .
git commit -m "Supabase migration: customer accounts + admin dashboard"
git push
```

On Vercel:
1. If you haven't already, import the repo. **Root Directory** = `web`.
2. Project Settings → Environment Variables. Add all the values from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SHEETS_WEBHOOK_URL`
   - `SHEETS_WEBHOOK_SECRET`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
3. **Important**: also configure **Supabase Auth redirect URLs**.
   Supabase → Authentication → URL Configuration:
   - **Site URL** = `https://your-vercel-domain.vercel.app`
   - Add `https://your-vercel-domain.vercel.app/auth/callback` under **Redirect URLs**.
4. Deployments → ⋯ → Redeploy.

> When you remove the old `ADMIN_PASSWORD` and `SESSION_SECRET` env vars from before (if they're still in Vercel), nothing breaks — they're no longer read.

---

## 6. (Later) Wire up the WhatsApp bot

See `whatsapp-bot/README.md` for the activation steps. Independent of the website; activate when ready.

---

## Troubleshooting

**Signup throws "Email confirmations required"**
You didn't disable email confirmation. Either disable it (step 2.4) or have testers click the link before logging in.

**`/admin` redirects to `/`**
Your logged-in email doesn't match `ADMIN_EMAIL`. Either log out and sign up with the matching email, or change `ADMIN_EMAIL` to the email you signed up with.

**Booking fails with "Not signed in"**
Cookie isn't persisting — happens locally if you're on `http://` instead of `https://`. Run via `npm run dev` on `http://localhost:3000`, not your LAN IP.

**Booking submits but no email**
Check the Vercel function logs for `[email]` warnings. Either `SHEETS_WEBHOOK_URL` is missing, or `SHEETS_WEBHOOK_SECRET` doesn't match the `SECRET` in deployed `Code.gs`. Apps Script changes need a **new deployment version** to go live.

**Vercel build fails**
Make sure Root Directory in Vercel project settings is `web`, not the repo root.
