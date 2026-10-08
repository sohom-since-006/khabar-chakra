# TRD — Khabar Chakra (খাবার চক্র)

> **Technical Requirements Document** · **Version 1.1** · Status: **Final draft, usable directly**
> Supersedes v1.0. Depends on PRD v1.1. Binding decisions: AGENTS.md §2 (D1–D24). Feeds: BACKEND SCHEMA · ARCHITECTURE · SECURITY · TESTING · CODE_STYLE.
> **Golden rule:** ₹0 recurring cost. Every service must have a usable free tier or be open source.
> ⚠️ Free-tier numbers marked ≈ are approximate and from general knowledge; **re-check each provider's pricing/terms page before Phase 1.**

## 0. What changed since v1.0
Next.js 16 line (`proxy.ts` replaces `middleware.ts`) · scheduled app jobs are **internal Next.js routes** (no Edge Functions) · backups never stored as public-repo artifacts · contact-reveal quotas · approximate-location rule · static pins · 48 h hard window ceiling · four organisation kinds · map focus on West Bengal · new route inventory · 18+ · Supabase Mumbai.

## 1. Purpose and Scope
How the product in PRD v1.1 is built: stack, constraints, algorithms, integrations, budgets, deployment and operations. Product behaviour lives in the PRD; table design in BACKEND SCHEMA; structure and flows in ARCHITECTURE; protections in SECURITY.
**In scope:** responsive PWA website, server logic, database, storage, auth, notifications, maps, on-device photo/OCR/barcode assistance, recipe and nutrition data, admin area, CI/CD, monitoring.
**Out of scope:** native apps, paid services, SMS OTP, payments, delivery logistics, live GPS tracking, in-app chat, users under 18.

## 2. Stack and Decisions
### 2.1 Stack
| Layer | Choice | Notes |
|-------|--------|-------|
| Language | TypeScript (`strict`) everywhere | One language end to end |
| Framework | **Next.js 16 line** (App Router) + React; Node.js **20.9+** | `proxy.ts` is the request-interception file (was `middleware.ts`), runs on Node by default. Keep on the latest patch; apply security releases within 48 h |
| Styling / UI | Tailwind CSS · shadcn/ui (Radix) · CSS variable tokens (Market Fresh) | Semantic tokens only |
| Animation | Framer Motion + CSS; optional GSAP ScrollTrigger | Reduced-motion aware |
| 3D background | three.js via @react-three/fiber and drei | Lazy chunk, landing page only |
| Forms / validation | React Hook Form + Zod (shared client/server) | |
| Data fetching | TanStack Query + Supabase JS client | |
| Charts | Recharts | |
| i18n | next-intl v4 (locale-prefixed routes, ICU) | English now; `bn`, `hi` in Phase 6 |
| Auth | Supabase Auth (email + password, Google, TOTP MFA for admins) | |
| Database | Supabase Postgres + PostGIS (+ pg_trgm, unaccent, pg_cron, pg_net) | Region **Mumbai** |
| Storage | Supabase Storage (public and private buckets) | |
| Server logic | Next.js route handlers, server actions, **internal job routes** | No Edge Functions in v1 (ADR-11) |
| Realtime | Supabase Realtime | Limited publication (ARCHITECTURE §11.2) |
| Push | Web Push (VAPID) with `web-push`, service worker | iOS only for installed PWAs |
| Email | Resend or Brevo (free tier) via SMTP/API | Built-in Supabase mailer is too limited |
| Maps | Leaflet + OpenStreetMap-based tiles from a **free-tier provider (chosen in Phase 4)**; Photon/Nominatim geocoding and Overpass called **server-side and cached** | |
| OCR / barcode / classifier | Tesseract.js, barcode detector (zxing-wasm polyfill), small TF.js/transformers.js model — all in Web Workers, self-hosted | |
| Product / nutrition / recipe data | Open Food Facts · USDA FoodData Central + IFCT (imported into our DB) · in-house recipes | |
| PWA | Serwist or hand-written service worker | |
| Hosting | Vercel Hobby (non-commercial use) | Cloudflare Pages is the fallback |
| CI/CD | GitHub Actions + Vercel previews | |
| Monitoring | Sentry free, Vercel Web Analytics, UptimeRobot | |
| Rate limiting / bots | Upstash Redis free tier · Cloudflare Turnstile | |

### 2.2 Architecture decisions
| # | Decision | Reason |
|---|----------|--------|
| ADR-1 | No separate Express server; Next.js route handlers satisfy "Node.js REST APIs" | Free always-on Node hosts sleep or limit hours |
| ADR-2 | Supabase (Postgres + PostGIS + Auth + Storage) | Real radius/rank queries; relational integrity |
| ADR-3 | Row Level Security is the primary authorisation layer | Defence in depth |
| ADR-4 | On-device AI first | Zero cost, privacy-friendly |
| ADR-5 | Shared pure-TypeScript domain module for scoring | One implementation, one test set |
| ADR-6 | Leaflet + OSM data, not Google Maps | No billing account |
| ADR-7 | Own recipe dataset is primary | Avoids licence limits; Indian/Bengali focus |
| ADR-8 | PWA, not native, for v1 | One codebase |
| ADR-9 | FSSAI "flag-and-guide" | Rejecting from a photo is neither accurate nor enforceable |
| ADR-11 | Scheduled app logic runs as **internal Next.js routes** triggered by pg_cron + pg_net (fallback GitHub Actions); time-critical rules stay in SQL | One runtime and language; `web-push` needs Node; no duplicated domain code |
| ADR-12 | Sensitive operations: route handler (validate + rate-limit) → RPC with the **user's** session | Adds limits without extra privilege |

## 3. Free-Tier Budget
| Service | Approx. free allowance | What matters | Mitigation |
|---------|----------------------|--------------|-----------|
| Vercel Hobby | ≈100 GB bandwidth/month, function time limits, coarse cron | Non-commercial only; keep each job run short | Batch jobs (≤ 500 rows); time-critical work in SQL; compress assets |
| Supabase Free | ≈500 MB database, ≈1 GB storage, ≈50k monthly users, ≈2 projects, Realtime ≈200 concurrent | **Pauses after about a week of inactivity**; no automatic backups; no image transformations | Keep-alive; weekly encrypted dump kept **outside the public repo**; thumbnails made on the device |
| Resend / Brevo | Resend ≈3,000/month (≈100/day); Brevo ≈300/day | Daily caps | Batch digests; critical mails only |
| Upstash Redis | Generous monthly command allowance | Cap | Rate-limit sensitive endpoints only |
| Sentry | ≈5k errors/month | Cap | Sampling |
| Open Food Facts | Free; descriptive User-Agent; no heavy scraping | Incomplete Indian coverage | Cache in DB; manual fallback |
| USDA FoodData Central | Free key, ≈1,000 requests/hour | | Import needed data once |
| Overpass / Nominatim / Photon | Fair-use public services (≈1 request/second for Nominatim) | Policy limits | Server-side calls, caching, debounce, per-district imports |
| Map tiles | OSM's own servers are not for heavy production use; free-tier providers have monthly limits and attribution rules | Ban/limit risk | Choose provider in Phase 4; OSM tiles for development only |
| GitHub Actions | Free minutes (public repos generous) | Minimum cron ≈5 min | Keep-alive and fallback job triggers |
**Capacity assumption (v1):** ≤ 5,000 registered users, ≤ 500 concurrent, ≤ 50,000 food items.

## 4. Technical Requirements
### 4.1 Platform
| ID | Requirement |
|----|-------------|
| TR-PLAT-1 | Latest two versions of Chrome, Edge, Safari, Firefox; Android and iOS browsers; mobile-first from 360 px. |
| TR-PLAT-2 | Camera via `getUserMedia` (HTTPS only); fallback to a file input with `capture`, and gallery upload. |
| TR-PLAT-3 | PWA: manifest, icons, service worker with offline shell and read-only last-seen inventory. |
| TR-PLAT-4 | iOS web push only for the installed PWA; in-app notifications are always the fallback. |
| TR-PLAT-5 | Node.js 20.9+ locally and in CI; exact versions recorded in `docs/VERSIONS.md`. |
### 4.2 Performance
| ID | Budget |
|----|--------|
| TR-PERF-1 | Landing mobile LCP ≤ 3.0 s (target 2.5 s); CLS ≤ 0.1; INP ≤ 200 ms on a mid-range Android over 4G. |
| TR-PERF-2 | Initial JavaScript for app routes ≤ 200 KB gzipped; route-level splitting. |
| TR-PERF-3 | 3D scene is a separate lazy chunk ≤ 500 KB gzipped; total models/textures ≤ 1.5 MB. |
| TR-PERF-4 | Heavy visuals downgrade automatically (reduced motion, low memory/CPU, low GPU tier, battery saver, data saver, FPS below 30 for 2 s) and pause off-screen. |
| TR-PERF-5 | User photos compressed on the device (long edge ≤ 1280 px, ≈300 KB WebP) plus ≈320 px thumbnail. |
| TR-PERF-6 | Fonts self-hosted, `swap`; Bengali/Devanagari loaded only for those locales. |
| TR-PERF-7 | Lists virtualised beyond ≈100 items; API p95 ≤ 500 ms for CRUD, ≤ 1 s for map/match queries; map queries return ≤ 100 rows with cursor paging. |
### 4.3 Operations
| ID | Requirement |
|----|-------------|
| TR-OPS-1 | **Keep-alive:** a daily GitHub Actions call to `/api/health` (which queries the database). UptimeRobot watches the same endpoint. |
| TR-OPS-2 | **Backups:** weekly encrypted dump run from a **separate private repository or private storage**, never as an artifact in the public repo; restore drill before launch. |
| TR-OPS-3 | **Idempotent jobs:** notifications use a unique dedupe key; impact writes unique per source. |
| TR-OPS-4 | Feature flags (database table) to switch off AI scan, emergency, event mode, 3D, push without redeploying. |
| TR-OPS-5 | Forward-only migrations via Supabase CLI, reviewed in CI; no manual production edits. |
| TR-OPS-6 | Structured logs with request IDs; no phone, email, address, document data, tokens or codes in logs. |
| TR-OPS-7 | Internal job routes: POST only, constant-time secret check, batches ≤ 500, safe to re-run. |
| TR-OPS-8 | Preview deployments use the staging project and non-production keys. |
### 4.4 Internationalisation
TR-I18N-1 all text in `messages/{en,bn,hi}.json` from day one (English populated at launch, fallback to `en`) · TR-I18N-2 locale-prefixed routes, `lang` attribute, Intl formats · TR-I18N-3 database content as per-language JSON, user text never auto-translated · TR-I18N-4 layouts tolerate +40% text and Bengali/Devanagari line heights · TR-I18N-5 admin area is English-only.
### 4.5 Accessibility
TR-A11Y-1 Radix primitives, visible focus, keyboard operable (including camera and a list alternative to the map) · TR-A11Y-2 status never by colour alone · TR-A11Y-3 global "Reduce animations" (may only reduce) · TR-A11Y-4 axe checks in CI for key pages in both themes · TR-A11Y-5 contrast of every token pair checked by a script.
### 4.6 Security (summary; full rules in SECURITY.md)
TR-SEC-1 RLS on every table · TR-SEC-2 service role only in approved server modules · TR-SEC-3 strict CSP, HSTS and related headers · TR-SEC-4 Turnstile and Upstash limits on abusable endpoints, failing closed for sensitive ones · TR-SEC-5 18+ confirmation at signup · TR-SEC-6 no third-party scripts besides Turnstile and Sentry; OCR/AI/3D assets self-hosted.

## 5. Core Algorithms (normative)
Implement once in `src/domain` as pure functions with the golden vectors in TESTING §6. Constants live in config/database tables. Rounding is half up.

### 5.1 Time basis
Packaged/raw items start at purchase date; deadline is the printed expiry if known, else purchase date + default shelf life for (category, storage). Cooked food starts at cooking time and uses safe hours. The printed expiry wins unless it is in the past while the user says the item is sealed (then ask). All timestamps in UTC; computed in the user's zone (default Asia/Kolkata).

### 5.2 Freshness score (0–100)
Inputs: hours remaining until the deadline; from the defaults table for (category, storage): amber hours, red hours, risk weight (≥ 1 for riskier food). Effective amber = amber × weight; effective red = red × weight.
- Remaining ≤ 0 → score 0, band expired.
- 0 < remaining ≤ effective red → score scales linearly from 1 to 39 (band red).
- effective red < remaining ≤ effective amber → scales from 40 to 69 (band amber).
- Above effective amber → scales from 70 to 100, reaching 100 at three times the effective amber (band green).
Unknown deadline → green, score 85, flagged low confidence. Example defaults (illustrative, to be sourced): leafy vegetables in the fridge 48/24 h, weight 1.0; milk in the fridge 48/24 h, weight 1.3; cooked rice/curry in the fridge 12/6 h, weight 1.5; bread at room temperature 48/24 h; packaged dry goods at room temperature 720/168 h, weight 0.8.

### 5.3 Food Waste Risk Score (0–100)
Risk = 100 × (0.40 × expiry pressure + 0.25 × quantity pressure + 0.20 × history + 0.15 × storage mismatch). Expiry pressure = 1 − score/100. Quantity pressure = quantity ÷ the household's weekly need for the category (capped at 1). History = share of this category the user discarded in the last 90 days (neutral 0.3 until five items are closed). Storage mismatch = 0 if stored as recommended, up to 1 if clearly unsuitable. Levels: Low < 34, Medium 34–66, High ≥ 67. Weights are config.

### 5.4 Use This First
Sort active items by band severity (red, amber, green), then least time remaining, then highest risk; show the first six.

### 5.5 Action ladder
Rules evaluated top-down: amber/green with a matching recipe → Consume; amber/red with surplus, listable category, not flagged, inside listing limits → Share/Donate; expired edible food → Compost or Responsible disposal; leftover packaging → Reuse, Recycle or Dispose per the waste guide; FSSAI-flagged → "do not consume" guidance. **Raw meat, fish and eggs never receive Share/Donate.**

### 5.6 Matching and ranking
Hard filters: verified organisation, accepting, food-type compatibility (veg/halal), listing still inside its window, within radius (default 1.5 km, widening to 3, 5, 10 km). Ranking: 50% nearness, 30% time-window fit, 20% capacity fit. **Before a request is approved, all distances and ranking use the public map pin, never the exact location.**

### 5.7 Nutrition
BMI = kg ÷ m². BMR by Mifflin–St Jeor (sex-specific); daily energy = BMR × activity factor (1.2, 1.375, 1.55, 1.725, 1.9). Macro split adjustable: protein ≈ 1.0–1.6 g/kg, fat 25–30% of energy, carbohydrate the remainder; show ranges. Pregnancy or medical conditions → "consult a professional". Meal score = 50% ingredient overlap with inventory + 30% near-expiry usage + 20% macro fit, after hard filters (diet, allergies).

### 5.8 Impact
Kg rescued = items closed as consumed/shared/donated while amber/red, plus completed pickups. Rupees saved = kg × category average price (admin table, shown in the UI). CO₂e avoided = kg × a documented coefficient with a cited source (**pending**). Waste diverted is tracked separately.

### 5.9 Listing window and category rules
Window = donor-chosen end time minus start; must be positive and ≤ the category's maximum, which itself can never exceed **48 hours** (enforced by database constraints). Cooked food also needs a preparation time no older than the category's limit. The locked category (meat/fish/egg) is refused. Daily publish limit per user (default 10; higher when verified).

### 5.10 Contact reveal quotas (configurable)
Per user: ≤ 30 reveals/hour; ≤ 3 reveals of the same contact/day; accounts younger than 24 h ≤ 5 reveals/day; Turnstile challenge after 10 reveals/hour. Denials return one generic result.

### 5.11 Approximate location
For home listings the public pin is the exact pin moved by a **fixed per-listing offset of about 100–200 m** (derived from the listing and a server secret, so averaging repeated views reveals nothing). Event venues use the exact pin. The exact location is stored separately and opens only per the visibility rules.

## 6. AI-Assisted Capture (on-device first)
Pipeline: compress and strip location data → try barcode (Open Food Facts lookup, cached) → OCR in a worker (dates, weights, FSSAI keyword + 14-digit licence number) → image classifier for loose produce and dishes → merge with per-field confidence → **mandatory editable confirmation screen**.
| ID | Requirement |
|----|-------------|
| TR-AI-1 | Auto-filled fields show confidence; low-confidence fields are highlighted and need confirmation. |
| TR-AI-2 | OCR and models load only when Add Food opens, are cached by the service worker, show progress, and are **self-hosted**. |
| TR-AI-3 | Everything runs in Web Workers. |
| TR-AI-4 | FSSAI detection uses text (keyword + 14-digit number), not the logo graphic; if neither is found on a packaged item the user confirms "not visible". |
| TR-AI-5 | Veg/non-veg detection is best-effort; the donor must choose for any listing. |
| TR-AI-6 | English OCR only at launch. |
| TR-AI-7 | Accuracy is stated honestly; manual entry is always one tap away. |
| TR-AI-8 | Optional server-side vision fallback only behind a feature flag with a hard monthly cap; off by default. |
| TR-AI-9 | Scanning photos are processed on the device; only the photo the user saves is uploaded. |

## 7. Server and API
### 7.1 Principles
Simple own-row CRUD goes through the Supabase client under RLS. Sensitive or abusable operations go **route handler (validate, rate-limit, Turnstile where needed) → RPC with the user's session**. Privileged work (signed URLs, push sending, audit writes, document byte checks, contact-form inserts) uses the service role only in approved modules. Inputs are validated with shared Zod schemas; errors use `{ error: { code, message, details? }, requestId }` with stable codes; responses containing contacts, codes, documents or admin data are `no-store`.

### 7.2 Route inventory
| Route | Purpose | Access |
|-------|---------|--------|
| GET `/api/health` | Database ping for keep-alive | public |
| `/api/items` (+ `/:id`, `/:id/close`) | Create/list/update/close inventory items | owner |
| GET `/api/barcode/:code` · GET `/api/buy-check` | Product lookup (cached) · Before-You-Buy | user |
| GET `/api/recipes/rescue` · GET `/api/nutrition/plan` | Recipe ranking · targets and meals | user |
| `/api/listings` (+ publish, extend, cancel, close) | Listing lifecycle (calls RPCs) | owner |
| GET `/api/listings/in-view` | Map/feed query (≤ 100 rows) | logged in |
| POST `/api/contacts/:id/reveal` | Reveal pickup contact (rate-limited, audited) | verified user |
| `/api/requests` (+ decide, complete-pickup) | Request, approve/decline, pickup code | user |
| `/api/swaps` (+ propose) | Smart Food Swap | user |
| `/api/events` (+ interest) | Event pre-announcement | verified host / organisation |
| GET `/api/orgs/nearby` · GET `/api/places` | Organisations and drop points | logged in |
| `/api/emergency` (+ offers) | Emergency requests | verified NGO / users |
| `/api/ngo/apply` · POST `/api/ngo/documents/upload-url` · POST `/api/ngo/documents/confirm` | Application; signed upload; magic-byte check | applicant |
| `/api/uploads/photo-url` · `/api/uploads/photo-confirm` | Signed photo upload and server check | user |
| `/api/admin/*` (queue, claim, open-document, mark-reviewed, decide, approvals, moderation, content, settings, inbox, audit) · POST `/api/admin/session-start` | Admin operations | admin + MFA |
| `/api/waste/guide` · `/api/waste/log` · `/api/waste/dropoffs` | Waste guidance and log | user |
| `/api/impact/me` · `/api/impact/public` | Dashboards | user / public aggregates |
| `/api/push/subscribe` | Web push subscription | user |
| `/api/reports` · `/api/blocks` | Report / block | user |
| POST `/api/contact` | Contact form (Turnstile + limit) → admin inbox | public |
| `/api/geo/search` · `/api/geo/reverse` | Server-side geocoding, cached | logged in |
| DELETE `/api/account` | Delete account | user |
| POST `/api/internal/jobs/freshness` · `/api/internal/jobs/dispatch` | Scheduled work | secret header only |

### 7.3 Rate limits (Upstash; sensitive ones fail closed)
Auth attempts 5/15 min per IP and account · contact form 3/hour · listing creation 10/day (verified higher) · requests/offers 30/hour · emergency requests by non-NGO 2/day, moderated · barcode/OCR assist 60/hour · contact reveals per §5.10 · geocoding 30/hour.

## 8. Integrations
### 8.1 Scheduled work and notifications
- **SQL jobs (pg_cron, no HTTP):** expire listings at window end, go-live of scheduled listings, expire requests and emergency requests, "15 minutes left" warnings, retention purge.
- **App jobs (pg_cron → pg_net → internal route):** hourly freshness recompute and alert generation; dispatch of push/email every 5 minutes. The route URL and secret are stored in Supabase Vault. GitHub Actions can call the same routes if pg_net is unavailable.
- Notifications are rows with a unique dedupe key; in-app delivery by Realtime; push/email by the dispatcher, which respects quiet hours and opt-ins, records delivery times, and removes dead push subscriptions.
- Email: transactional always (verify, reset, organisation status, request approved); digests opt-in, one per day, batched.
- Copy is templated and localisable; push payloads carry no personal data.

### 8.2 Maps and places (West Bengal focus)
- Leaflet map with clustering plus a list-view equivalent. Default centre **Asansol**; outside West Bengal a friendly note appears.
- `places` is filled from a hand-curated Asansol list and per-district Overpass imports (organisations, recycling, compost, scrap dealers, community gardens), keeping the source and any Bengali name. Non-partner places are labelled "Not verified by Khabar Chakra".
- Geocoding and reverse geocoding run on the server with caching and debounce; the pin can always be dragged. Users' exact locations are never sent to third parties beyond what a search needs.
- Directions use external map links (no routing service). Required attributions are always visible.

### 8.3 Barcode and product data
Lookup order: our cache → Open Food Facts → manual entry. Only product-level data is cached.

### 8.4 Recipes and nutrition
In-house `recipes` and ingredient tables (≥ 100 Indian/Bengali recipes at launch) with nutrition computed from `nutrition_foods` (USDA + IFCT imports, source and licence recorded). Ingredient aliases bridge English, Bengali and Hindi names.

### 8.5 Email deliverability
Without a custom domain, use the provider's shared sender and expect some spam-folder delivery; in-app notifications are primary. Revisit when a domain exists (SPF/DKIM/DMARC).

## 9. Environments, Configuration, CI/CD
- **Environments:** local (Supabase CLI) · staging (free project) · production (Mumbai). Previews use staging only.
- **Configuration (names only):** site URL; Supabase URL, anon key, service-role key; VAPID public/private keys; email provider key or SMTP settings; Upstash URL/token; Turnstile site/secret keys; map tile URL; Sentry DSN; internal cron secret; admin alert email; feature-flag overrides; optional vision key (off).
- **Pipeline:** PR → install, lint, typecheck, unit/component, database tests, API tests, build, bundle-size, Playwright smoke, axe, Lighthouse CI, secret scan and audit → Vercel preview. Merge → migrations to staging → full E2E → production (manual approval for migrations). Scheduled: keep-alive, nightly full suite and security scan, weekly backup (outside the public repo).
- **Rollback:** Vercel instant rollback; backwards-compatible migrations (expand → migrate → contract); backup before destructive changes.

## 10. Data Handling
| ID | Requirement |
|----|-------------|
| TR-DATA-1 | RLS on all user-data tables; tests prove user A cannot read user B. |
| TR-DATA-2 | Organisation documents in a private bucket; only owner and admins; signed links ≤ 60 s; PDF/JPEG/PNG ≤ 5 MB with magic-byte verification. |
| TR-DATA-3 | Public pin per §5.11; exact location opens only per visibility rules. |
| TR-DATA-4 | Contacts live in a separate table readable only by owner/admin; everyone else goes through `reveal_contact()`. |
| TR-DATA-5 | Account deletion hides data immediately and purges within 30 days; aggregate impact is anonymised. |
| TR-DATA-6 | Admin actions and document views go to an append-only audit log (no PII). |
| TR-DATA-7 | Quantities stored with unit and a normalised base value. |
| TR-DATA-8 | Localised content stored as per-language JSON. |
| TR-DATA-9 | Free-text listing fields reject or mask phone numbers and emails. |
| TR-DATA-10 | Retention per BACKEND SCHEMA §20. |

## 11. Observability
Sentry (PII scrubbing), privacy-friendly aggregate analytics, structured logs, UptimeRobot on `/api/health`, GitHub Actions failure emails, admin sign-in alerts. Merge gates: lint, types, tests, no new axe violations, Lighthouse budgets met, no secrets.

## 12. Technical Risks
| Risk | Mitigation |
|------|-----------|
| Large on-device models slow on cheap phones | Lazy load with progress, skip to manual, cache, size cap (≈ 10 MB total) |
| OCR accuracy on dates | Preprocessing, tolerant parsing, confirmation, barcode and defaults |
| Supabase pause/limits | Keep-alive, monitoring, backups outside the repo, plain-Postgres exit path |
| OSM service policies | Cache, rate-limit, free-tier tile provider, per-district imports |
| iOS push limits | Installed-PWA prompt + in-app + email fallbacks |
| RLS or function-grant mistakes | Policy tests in CI, revoke default grants, human review of security diffs |
| 3D hurts low-end devices | Capability detection, FPS watchdog, static fallback |
| Free email lands in spam | In-app first; revisit with a domain |
| Framework security releases | Track releases; patch within 48 h |

## 13. Open Technical Questions
| ID | Question | Needed by |
|----|----------|-----------|
| OQ-1 | CO₂e coefficient and cited source | Phase 5 |
| OQ-2 | Shelf-life defaults and sources | Phase 2 |
| OQ-3 | Free tile provider, attribution and dark style | Phase 4 |
| OQ-6 | On-device food model choice after a test on ~50 Indian food photos | Phase 2 |
| OQ-7 | Exact installed versions of Next.js, Tailwind, next-intl, Supabase client libraries (record in `docs/VERSIONS.md`) | Phase 1 |
*Closed:* repository public later; domain later; backups location; jobs runtime; region.

## 14. Traceability (PRD → TRD)
Auth/profile → §2, §7, §10 · Add food/FSSAI → §6, TR-PLAT-2 · Tracking/Buy → §5.1–5.5, §8.1 · Recipes/nutrition → §5.7, §8.4 · Sharing/events/emergency → §5.6, §5.9–5.11, §7.2, §8.2 · Organisations/admin → §7.2, TR-DATA-2/6 · Waste/impact → §5.8, §8.2 · Site/Help → §2.1, §4 · Map → §8.2.

---
*End of TRD v1.1.*