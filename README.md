<div align="center">

# 🥬 Khabar Chakra · খাবার চক্র

### Save • Share • Sustain

**A free, community food-lifecycle website: track food freshness, share surplus (from homes, weddings and events) with people and verified organisations nearby for a limited time, and handle leftover waste the right way.**

`Buy → Track → Store → Consume → Cook → Share → Donate → Reuse → Recycle → Dispose responsibly`

Live site: *to be added after the first deploy* · [Report a bug](../../issues) · [Documentation](./docs)

</div>

> **For everyone:** you must be **18 or older** to use Khabar Chakra. The platform helps people decide what to do with food; **it never certifies that any food is safe**. The person receiving food decides. A green ✔ verified badge only means an organisation's documents were reviewed by Khabar Chakra.

---

## Contents
1. What is Khabar Chakra? · 2. Features · 3. Tech stack (all free) · 4. Run it on your computer · 5. Settings (environment variables) · 6. Commands · 7. Project structure · 8. Deploy for free · 9. Setting up the four admins · 10. Testing · 11. Free-tier care · 12. Troubleshooting · 13. Documentation map · 14. Roadmap · 15. Contributing, security, licence · 16. The team

---

## 1. What is Khabar Chakra?
*Khabar* (খাবার) means **food**; *Chakra* (চক্র) means **cycle**. Food is wasted because people lose track of it at home, because weddings and functions end with large leftovers and no quick way to pass them on, and because nobody explains what to do with the packaging afterwards.

- **Prevent waste:** add food by photo, barcode or typing; see a colour-coded freshness status; get alerts; cook recipes from what is about to expire; avoid buying what you already have.
- **Share surplus:** list food for a time window you choose (up to 48 hours) with photos and a map pin. Logged-in, email-verified people can see your pickup contact only while the window is open. Hosts, caterers and banquet halls can pre-announce events to verified organisations.
- **Handle waste responsibly:** reuse, recycle, compost or dispose guidance with nearby drop points.
- **See your impact:** food rescued, money saved, waste diverted.

Built first for **West Bengal (starting in Asansol)** and designed to grow across India.

## 2. Features
| Area | What you get |
|------|--------------|
| Accounts | Email + password or Google, email verification, reset/change password and email, profile, language, light/dark mode, 18+ confirmation |
| Add food | Take a photo (with retake), upload, scan a barcode or type; on-device text reading suggests dates; you always confirm |
| Freshness | 🟢 Fresh · 🟡 Consume soon · 🔴 Expiring, "Use This First" shelf, Food Waste Risk Score |
| FSSAI check | Flags a missing FSSAI mark on packaged food and guides you to the official complaint route |
| Before You Buy | Scan in a shop to see if you already have it |
| Recipes and nutrition | Indian/Bengali recipes from near-expiry items; BMI, calories, macros; meals from what you have |
| Available Food | One page for everything shareable: list + map, **ending soonest first**, with filters |
| Share, donate, swap | Photos required; static map pin; pickup contact visible to logged-in, verified users during your window (or after you approve); pickup code to confirm handover |
| Events | Weddings, parties, functions: pre-announce surplus to verified organisations, then post it when ready |
| Verified badges | Green leaf-tick for admin-approved NGOs, caterers, banquet halls and trusted authorities |
| Emergency requests | Verified NGOs can post urgent food needs |
| Waste guide | Reuse / recycle / compost / dispose steps and nearby drop points |
| Impact | Animated charts, badges and streaks (points have no cash value) |
| Help and support | Help Centre, working FAQ, contact form (messages go to an admin inbox). Technical support shows **Coming soon** |
| Live background | 3D food garden on the landing page that simplifies automatically on weak devices or with "Reduce animations" |
Raw meat, fish and eggs can be **tracked** but can **never be listed** for sharing. Cooked dishes can be shared under stricter time limits.

## 3. Tech stack (all free)
Next.js (App Router, the 16 line) · React · TypeScript (strict) · Tailwind CSS · shadcn/ui · Framer Motion · three.js (react-three-fiber) · Supabase (Postgres + PostGIS, Auth, Storage, Realtime, pg_cron + pg_net, region Mumbai) · Vercel (Hobby) · Leaflet with OpenStreetMap-based map tiles (provider chosen in Phase 4) · Tesseract.js, barcode detector and a small on-device food model · Open Food Facts · Web Push · Resend or Brevo (email) · Upstash (rate limiting) · Cloudflare Turnstile · Sentry (optional) · Vitest, Playwright, pgTAP, axe, Lighthouse CI, GitHub Actions.
**Fonts:** Caveat (cursive accents) + Nunito; Bengali Atma/Hind Siliguri; Hindi Kalam/Hind. **Palette:** "Market Fresh" (see DESIGN SYSTEM).
Free-tier limits change; re-check each provider before you deploy (TRD §3). Record the exact installed versions in `docs/VERSIONS.md`.

## 4. Run it on your computer
**You need:** Node.js **20.9 or newer** (check `node -v`), npm, Git, Docker Desktop (for the local database) and the Supabase command-line tool (run through `npx`).
**Steps:**
1. Clone the repository and open its folder.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Make sure Docker is running, then run `npm run db:start`. It prints local keys; paste the API URL, anon key and service-role key into `.env.local`.
5. Run `npm run db:reset` to create tables, rules and starter data.
6. Generate push-notification keys with `npx web-push generate-vapid-keys` and paste them into `.env.local`.
7. Run `npm run dev` and open http://localhost:3000.
**Local addresses:** website `localhost:3000` · database dashboard `localhost:54323` · **test email inbox `localhost:54324`** (verification and reset emails land here) · API `localhost:54321`.
**Demo data:** `npm run seed:demo` loads fake users, food, listings and a demo organisation (local/staging only; fictitious phone numbers).
**Testing the camera on a phone:** browsers allow the camera only on `localhost` or HTTPS; run `npm run dev:https` or use a free tunnel and open the printed address on your phone.

## 5. Settings (environment variables)
Copy `.env.example` and fill in. **Never commit `.env.local` or any real key.** Names starting with `NEXT_PUBLIC_` are visible in the browser.
- Site: `NEXT_PUBLIC_SITE_URL`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only)
- Web push: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (server only), `VAPID_SUBJECT`
- Email: `RESEND_API_KEY` (or SMTP settings)
- Rate limiting: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Bot protection: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- Maps: `NEXT_PUBLIC_MAP_TILE_URL`
- Scheduled jobs: `INTERNAL_CRON_SECRET` (server only)
- Admin alerts: `ADMIN_ALERT_EMAIL` (server only; never put a real address in the repository)
- Optional: `SENTRY_DSN`, feature-flag overrides, a vision key (off by default)

## 6. Commands
`dev`, `dev:https`, `build`, `start` · `lint`, `typecheck`, `format` · `test` (unit and component), `test:db` (database rules), `test:e2e` (browser), `test:a11y`, `test:trace`, `lighthouse` · `db:start`, `db:stop`, `db:reset`, `db:push`, `db:types` · `seed:demo`, `seed:places` (map places for a district) · `check:contrast`, `check:i18n`. Run each as `npm run <name>`.

## 7. Project structure
`src/app` (pages and routes, including `[locale]` pages, the admin area at `[locale]/admin`, `api` routes and private `api/internal/jobs`) · `src/features` (auth, profile, inventory, capture, recipes, nutrition, listings, requests, events, organizations, emergency, waste, impact, notifications, help, admin, landing) · `src/components` (shared UI: badge, countdown, map, background, mascot, FAQ) · `src/domain` (pure business logic) · `src/lib` (Supabase clients, settings, rate limiting, fonts, motion, time) · `src/workers` (OCR and classifier) · `src/styles` (design tokens) · `messages` (en, bn, hi) · `supabase` (migrations, seed, database tests) · `tests` · `public` (icons, 3D models, illustrations) · `scripts` · `docs` · `.github/workflows`. The request-interception file is **`proxy.ts`** (it was `middleware.ts` before Next.js 16). Full layout: ARCHITECTURE §5.

## 8. Deploy for free
You need free accounts on **GitHub, Supabase and Vercel**; for full features also **Resend or Brevo, Upstash and Cloudflare (Turnstile)**. Check current terms on each.

**Supabase**
1. Create a project and choose the **Mumbai** region (check it is offered).
2. Enable the extensions PostGIS, pg_cron, pg_net, pg_trgm and unaccent.
3. Log in with the CLI, link the project and run `npm run db:push`.
4. Store the site URL and `INTERNAL_CRON_SECRET` in Supabase Vault so the scheduled jobs can call the app's private job routes.
5. Authentication settings: confirm email **on**; secure email and password change **on**; CAPTCHA (Turnstile) **on**; refresh-token rotation **on**; site URL and exact redirect URLs; custom SMTP; (optional) Google sign-in.
6. Check that `ngo-docs` and `food-photos` are **private** and that the cron jobs appear under Database → Cron.
7. Apply the hardening checklist in SECURITY §12.1.

**Vercel**
1. Import the GitHub repository and add the environment variables (server-only ones as non-public). Production secrets go to Production only; **Preview deployments use the staging project**.
2. Deploy to get a free `*.vercel.app` address, then set that address as `NEXT_PUBLIC_SITE_URL` and in Supabase's redirect list, and redeploy.
3. A custom domain can be added later (update the same places and the email provider).
Vercel's free Hobby plan is for **non-commercial** use.

**Other services:** Resend/Brevo (API key; without a domain mail may land in spam) · Upstash (free Redis, REST URL and token) · Cloudflare Turnstile (site key and secret) · Sentry (optional) · UptimeRobot (optional, watch `/api/health`).

**Pre-launch checklist:** SECURITY §19 and TESTING §12 release checklist.

## 9. Setting up the four admins
There is **no separate admin login page**. Admins sign in on the normal Login page; an "Admin" menu item then appears and asks for an authenticator-app code. Anyone else who types an admin address sees the standard "Page not found".
For each of the four admins: (1) create a normal account and verify the email; (2) in Profile → Security set up two-factor authentication with an authenticator app and register **two devices**; (3) a database owner marks the account as an admin using the Supabase SQL editor (never in code or the repo); (4) sign out and back in.
**Rules:** never write admin emails in code, issues, commits or docs. Admins open and review **every required document** before approving. **Two-admin rule:** approving a trusted authority and permanently revoking or restoring a badge need a second admin; one admin may suspend immediately in an emergency and a second reviews within 24 hours. Every admin action is recorded in a private audit log.

## 10. Testing
Run `npm test` (fast), `npm run test:db` (database rules, needs the local database), `npm run test:e2e` (browser journeys) and `npm run test:a11y`. A pull request must pass lint, types, unit/component, database, smoke browser tests, accessibility, bundle-size, Lighthouse and secret scans. Details: TESTING.md.

## 11. Free-tier care
Free database projects can **pause after about a week without activity** and have **no automatic backups**.
- A daily GitHub Actions job calls `/api/health` to keep the project awake.
- **Backups:** run the weekly encrypted dump from a **separate private repository** (or save it to private storage). **Never store production backups as workflow artifacts in this public repository** — other GitHub users can download artifacts of public repositories.
- Practise a restore at least once before launch.

## 12. Troubleshooting
| Problem | Fix |
|---------|-----|
| Database does not start | Start Docker Desktop; make sure ports 54321–54324 are free |
| No verification email locally | Open localhost:54324 |
| Camera does not open on a phone | Use HTTPS (`dev:https`); on iPhone use Safari; check site permissions |
| Push does not arrive on iPhone | iOS allows web push only for sites added to the Home Screen; in-app notifications still work |
| "Database unavailable" in production | The free project may be paused; restore it in the Supabase dashboard |
| Map tiles blank | Check `NEXT_PUBLIC_MAP_TILE_URL` and the provider's free limits |
| Emails go to spam | Expected without a custom domain; use in-app notifications |
| 3D background is slow | Choose "Reduce animations"; weak devices switch automatically |
| `/admin` says "Page not found" for you | Normal for non-admins; confirm your account is an admin and you completed the authenticator step |
| Build fails after upgrading | Check you are on Node.js 20.9+, that the interception file is `proxy.ts`, and read the upgrade notes of the installed Next.js version |

## 13. Documentation map
PRD (what and why) · TRD (stack, algorithms, limits) · BACKEND SCHEMA (data, rules, jobs) · ARCHITECTURE (design and code layout) · DESIGN SYSTEM (palette, fonts, components) · SECURITY (rules and reporting) · TESTING (strategy and gates) · CODE_STYLE (conventions) · AGENTS (rules for AI coding assistants). All in `docs/`.

## 14. Roadmap
Phase 1 Foundation (design system, landing, auth, profile, legal, Help/FAQ/Contact, Team page) · 2 Scan and Track · 3 Alerts, recipes, nutrition · 4 Share and Community (listings, map, events, organisations, admin, emergency) · 5 Waste and Impact · 6 Polish and launch (Bengali and Hindi, accessibility and performance passes). Later ideas: native apps, inventory prediction, municipal pickup routing, IoT freshness sensors, recycling-point integrations.

## 15. Contributing, security, licence
- **Contributing:** read `CONTRIBUTING.md` and CODE_STYLE. Every change needs tests and updated docs. Small, focused pull requests.
- **Security problems:** do **not** open a public issue. Use GitHub's private "Report a vulnerability" on this repository (see SECURITY.md §16).
- **Code of Conduct:** be kind and respectful (`CODE_OF_CONDUCT.md`).
- **Licence:** the source code is planned to be released under **MIT** *(to be confirmed by the team before the repository goes public)*. The **name "Khabar Chakra", the logo and brand artwork are not covered** by the code licence. Third-party data (OpenStreetMap, Open Food Facts, USDA FoodData Central, IFCT) keeps its own licence and attribution, listed in `docs/THIRD_PARTY.md`.
- **Self-hosting:** anyone may run their own copy with their own free accounts by following sections 4 and 8. No production data, keys or admin details are in this repository.

## 16. The team
**Made by [The S-QUAD](/en/team)**, students of Asansol Engineering College, West Bengal: **Sohom Paul** (full-stack development, video editing) · **Snehasish Kundu** (C programming, emerging full-stack development) · **Shreyasi Acharya** (C and Python programming, data structures and algorithms) · **Shuvangi Dutta** (UI/UX design, creative content).
**Technical support:** *Coming soon.* Until then, use the contact form on the website.

<div align="center">🥬 *Save • Share • Sustain* 🌱</div>