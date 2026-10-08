# MASTER PROMPT — Build Khabar Chakra (Phases 1–6), whole application, one continuous run

You are a senior full-stack engineer and art director. Build the complete **Khabar Chakra (খাবার চক্র)** web application from the project documents. Work autonomously. Everything you build must actually run and work.

## 0. Authorization and mode
- This message is the human's explicit instruction to **start Phase 1 and continue through Phase 6 in one continuous run.** It overrides only two AGENTS.md rules: "do not write application code until told" and "do not start later phases early". Every other rule in AGENTS.md still applies.
- **Do not stop to ask questions.** When something is unclear, apply the safest default, record it in `docs/DECISIONS.md`, and continue. Stop only for the hard blockers in §2.4.
- Keep `docs/PROGRESS.md` current (task list with status). Commit after every task with Conventional Commits. If you run out of context, resume from `docs/PROGRESS.md`.
- Never invent API keys, secrets, real organisations, real people, legal text, government procedures, sourced numbers (shelf life, CO₂e, prices) or nutrition facts. Use clearly marked placeholders and list them in the final report.

## 1. Sources and precedence
Read **all** of these completely before writing code: `AGENTS.md`, `docs/PRD.md`, `docs/TRD.md`, `docs/BACKEND SCHEMA.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN SYSTEM.md`, `docs/SECURITY.md`, `docs/TESTING.md`, `docs/CODE_STYLE.md`, `docs/phase-1/PHASE-1-SPEC.md`, `docs/phase-1/PHASE-1-BUILD-KIT.md`, `README.md`.

**Precedence when documents disagree:** (1) §1.1 below → (2) AGENTS.md §2 decisions → (3) SECURITY.md → (4) BACKEND SCHEMA.md → (5) TRD.md → (6) PRD.md → (7) the rest. Flag every conflict in `docs/DECISIONS.md`.

### 1.1 Binding overrides and corrections (latest instructions win)
- **D25** All pages are rendered per request (no static/ISR HTML caching). **D26** Identity checks use `getClaims()`; sensitive actions also use `getUser()`; never `getSession()` on the server. **D27** Supabase key names: publishable key (browser) and secret key (server only). **D28** `app_now()` is plain `now()`; tests redefine it inside their own rolled-back transaction. **D29** Baseline enforced CSP plus a nonce-based CSP in report-only mode; tighten to nonce-only before finishing (task T1.8). **D30** `locales: ['en']` until Phase 6, where you add Bengali and Hindi.
- Next.js 16 line: `proxy.ts` (not `middleware.ts`), Node ≥ 20.9, async `params` and `cookies()`, no `next lint`. Tailwind v4 (CSS-first). Install current versions, record them in `docs/VERSIONS.md`, and read the installed libraries' docs before using their APIs.
- **D31 (design direction)** The "Design Direction" in §7 **supersedes the visual style in DESIGN SYSTEM.md**: no glassmorphism or blur, no floating blobs, no everything-in-rounded-cards, no pill overuse, no glow, minimal shadows. Default border radius ≤ 4 px; larger only for avatars and switches. Keep the semantic **colour tokens, contrast ratios, focus rules, touch-target sizes and reduced-motion rules** — restyle how they look, never weaken accessibility.
- **D32 (typography)** The earlier font choice (Caveat + Nunito) is **superseded**. Choose your own distinctive, free (OFL), self-hosted families by role: an editorial display face, a highly readable text face, tabular figures for data, and **one cursive handwriting family for short annotations** (the team requires a handwriting accent paired with normal text). Plan Bengali and Devanagari companions with the same roles. Document the choices and reasons in `docs/DESIGN-DECISIONS.md`.
- **D33 (live background)** Replace drifting blobs/particles with **one art-directed 3D still-life** (a single food object treated like product photography) on the landing page, plus restrained type motion elsewhere. Keep the tier system (3D / light / static), FPS watchdog, reduced-motion and data-saver rules, and the performance budgets.
- **D34** The app is a **full multi-page application**; every major page type has its **own composition** (see §7.4). It is not a single scrolling site.
- **D35** All project decisions D1–D24 in AGENTS.md remain binding except D24's font choice.
- **D36** Optional keys stay **blank**; every feature must degrade gracefully (see §4). The project must run fully on a laptop with no paid or third-party account.

## 2. Execution protocol
### 2.1 Step 0 — Preparation (before any app code)
1. Read the documents; write a short implementation plan to `docs/IMPLEMENTATION-PLAN.md` (phases, tasks, risks, dependency order).
2. Apply the corrections in §1.1 to the documents that mention outdated things (anon/service-role names, validated-user lookup, static/ISR caching, `middleware.ts`, Edge Functions, Caveat+Nunito). Note edits in `docs/DECISIONS.md`.
3. For Phases 2–6, write `docs/phase-N/PHASE-N-SPEC.md` (user stories with Given/When/Then acceptance criteria, screens, states, copy, edge cases) derived from PRD requirement IDs, in the style of PHASE-1-SPEC.md. Write each spec **before** coding that phase.

### 2.2 Environment and setup
- Check Node ≥ 20.9, npm, Docker (running) and Git. Create `scripts/setup.mjs` and the script `npm run setup` that: checks prerequisites → starts local Supabase → reads `supabase status -o env` (VERIFY the command) → writes `.env.local` from `.env.example` (Supabase values, Turnstile **test** keys, generated random secrets for `IP_HASH_SALT` and `INTERNAL_CRON_SECRET`) → resets the database → generates types → loads reference and demo seeds → prints URLs and demo logins. The result: `git clone` → `npm install` → `npm run setup` → `npm run dev` works with **no external accounts**.
- Follow `docs/phase-1/PHASE-1-BUILD-KIT.md` for bootstrap, structure, tokens, i18n, Supabase clients, proxy, migrations. Where it conflicts with §1.1, §1.1 wins.

### 2.3 Per-phase loop (repeat for Phases 1→6)
1. Spec (§2.1.3). 2. Migrations + database tests (RLS, grants, constraints; every table has allow and deny tests). 3. Domain code + unit tests (use TESTING §6 golden vectors). 4. Routes/actions/RPCs with validation and rate limits. 5. UI per the art direction. 6. Playwright E2E for the phase's journeys, axe checks, and **visual QA** (§2.6). 7. Run all gates (§2.5); fix failures properly. 8. Update docs, `docs/PROGRESS.md`, commit. 9. Next phase.

### 2.4 Hard blockers (stop and report; do not guess)
Docker or Node unavailable · a task would need a paid service or real credentials · a destructive or irreversible operation · a security or privacy rule would have to be weakened to proceed. Everything else: choose the safe default and continue.

### 2.5 Quality gates (TESTING §4) — every phase and at the end
Lint, typecheck, unit/component, pgTAP, API tests, E2E, axe (0 serious/critical, light and dark), Lighthouse mobile (Performance ≥ 80; Accessibility, Best Practices, SEO ≥ 90), bundle budgets (app routes ≤ 200 KB gz; 3D chunk ≤ 500 KB gz and only on the landing page), secret scan, contrast script for all tokens, i18n check (no hard-coded strings), and **a build-output check that the secret key never appears in client bundles**. Never skip, weaken or delete a test to pass a gate.

### 2.6 Visual QA protocol (use your integrated browser/screenshot ability)
For every page and state: screenshots at **360, 768 and 1280 px** in light and dark; no console errors; no layout shift; keyboard path works; reduced motion works. Save to `docs/qa/` and note defects fixed. Run the **Design Quality Test** in §7.8 before finishing each phase and at the end.

### 2.7 Finish
Full regression, then `docs/RUNBOOK.md` (setup, deploy to Supabase + Vercel free tiers, backups outside the public repo, keep-alive, restore drill, incident basics), `docs/API_KEYS.md` (§4), `docs/THIRD_PARTY.md` (licences), `docs/DESIGN-REVIEW.md`, and the final report (§9).

## 3. Scope — everything below must work end to end
**Phase 1 Foundation** — design system; landing; sign-up with 18+ and Turnstile; email verification (local mail at the Mailpit address); login/logout/log out of all devices; forgot/reset/change password and email; welcome/age gate; profile and settings (theme, language switcher shell, Reduce animations, notification preferences, delete account); Help Centre; FAQ (every item opens/closes by mouse and keyboard, deep links, search); contact form → admin inbox; "Technical support: Coming soon" driven by `site_settings`; Team page (plain-text names and bios from PHASE-1-SPEC §6.7, no contact details); footer ending "Made by The S-QUAD" linking to Team; legal pages with a visible draft banner; 404/error pages; SEO; security headers.
**Phase 2 Scan & Track** — add food by camera (with Retake), gallery upload, barcode (Open Food Facts, cached; works with no key), manual entry; on-device OCR/barcode/classifier in Web Workers, self-hosted, loaded only on this screen, with per-field confidence and the **mandatory editable confirmation screen**; FSSAI flag-and-guide; inventory (search, filters, sort, view modes); freshness score and bands exactly per TRD §5.2; Use This First shelf; Food Waste Risk Score; Before You Buy scanner; meat/fish/egg tracked but never listable (UI and database).
**Phase 3 Alerts, Recipes, Nutrition** — in-app notifications with Realtime; web-push (VAPID keys generated locally) with graceful skip when unsubscribed; internal job routes for freshness and dispatch, secured by the cron secret, plus the SQL jobs; recipe rescue with diet/allergy hard filters and alias matching (English/Bengali/Hindi names); recipe pages; nutrition planner (BMI, BMR/TDEE, macros, disclaimers); meal suggestions from inventory; at least 30 original recipes seeded (stretch 100) with nutrition computed from a clearly marked sample ingredient table.
**Phase 4 Share & Community** — listings (photos 1–4 required, static pin, window ≤ 48 h enforced in the database, cooked-food limits, sender confirmation, free-text phone/email rejection); Available Food (list + map, default order ending soonest, filters, view modes); swaps; requests, approval, pickup code; contact reveal exactly per BACKEND SCHEMA §8.9 with quotas and audit; events and pre-announcements; organisation applications for NGO, caterer, banquet hall and authority with per-kind documents, private storage and magic-byte checks; **admin area** (hidden menu, MFA step-up, standard 404 for everyone else, case claim, document viewer with ≤ 60 s links, "mark reviewed" gating approval, two-admin rule, moderation, content and settings editors, contact inbox, audit log, sign-in alert); verified badge (unique leaf tick with tooltip on hover/focus/tap); emergency requests for verified NGOs; reports and blocks; **the map** (below).
**Phase 5 Waste & Impact** — waste guide (five cards per type) with drop-points map; recycling log; impact ledger (idempotent), dashboard with published formulas; badges, streaks, opt-in leaderboard; public aggregate counters.
**Phase 6 Polish & Launch** — Bengali and Hindi UI with fonts per language and the cursive accent per language; performance and accessibility passes; PWA (manifest, icons, offline shell, read-only last-seen inventory); SEO; final security checklist (SECURITY §19); keep-alive workflow; load-test script; release checklist (TESTING §12).

### 3.1 The map must work (Leaflet + OpenStreetMap data)
- Interactive map with clustering, kind-shaped pins, countdown on pins, selected-pin panel/sheet, **list view with identical data**, user-location button (permission asked once), "Open in Maps" directions link, attribution always visible.
- Default centre **Asansol**; a friendly note outside West Bengal; Bengali place names when available.
- Tiles: read `NEXT_PUBLIC_MAP_TILE_URL`; **if blank, use the standard OpenStreetMap tile URL for development only**, with attribution and a dev-only console notice that production needs a provider key. Never hide attribution.
- Address search and reverse search: server routes calling Nominatim or Photon with a descriptive User-Agent, caching, debounce and rate limits; the pin is always draggable.
- Places: `places` table; import script for OpenStreetMap places by district (Overpass), a curated CSV **template** for the team's real Asansol list (do not fabricate organisations), and clearly flagged demo places for local use. Non-partners show "Not verified by Khabar Chakra".
- Feed queries use the **public pin** only; `rpc_listings_in_view` returns ≤ 100 rows.

## 4. Keys, secrets and graceful degradation
All optional variables in `.env.example` are **blank**. Never commit real values. Create `docs/API_KEYS.md` listing every variable (purpose, where to get it, free-tier note, behaviour when blank), and the optional integrations in Appendix A. Required behaviour when a key is blank:
| Blank key | Behaviour |
|-----------|-----------|
| Upstash URL/token | Dev: limits skipped with a warning; production: sensitive routes fail closed |
| Email provider | Local: Mailpit; production: not configured → emails not sent, clear admin warning |
| VAPID keys | Generated by the setup script locally; push toggles hidden if missing |
| Map tile URL | OSM dev tiles (dev only) |
| Turnstile | Local: Cloudflare test keys |
| Sentry DSN | No error reporting |
| Google OAuth | Google button hidden |
| USDA/other data keys | Skip imports; use bundled sample data |
| Vision fallback key | Feature stays off |
Never ship a feature that crashes because an optional key is empty.

## 5. Demo data and accounts (local and staging only)
Seed scripts **refuse to run** unless the site URL is localhost or staging. Create: member, donor_home, member_new, member_blocked, caterer_verified, caterer_unverified, banquet_verified, authority_verified, ngo_approved, ngo_pending, ngo_suspended, and **admin_1…admin_4** — all with `@example.com` emails, a documented demo password in `docs/DEMO-ACCOUNTS.md`, fictitious phones `+91 90000 0xxxx`, and **TOTP enrolled for the admins through a script** (no security bypass; tests generate codes with a TOTP library). Seed inventory, ~25 live and ended listings around Asansol with generated placeholder photos (clearly labelled "demo photo"), events, requests, organisations with generated demo documents, reports, impact history, FAQ/help content, and the contact inbox.

## 6. Engineering rules (non-negotiable; see AGENTS.md §3 and SECURITY.md)
Row-level access rules on every table with allow/deny tests · contacts and exact locations only via `reveal_contact()` and the visibility rules · window ≤ 48 h in the database · meat/fish/egg locked · photos required · RPC grants revoked from anonymous callers · secret key only in approved server modules · never log personal data · generic errors for sensitive failures · admin identical-404 behaviour · no hard-coded UI strings · accessibility and performance budgets · Conventional Commits · docs updated with every change.

## 7. DESIGN DIRECTION — IMPORTANT

Design and build this website so it does **NOT** look like an AI-generated website. Do not fall back on common AI/SaaS design patterns. The result should feel designed by an experienced product designer and creative art director with a strong personal visual identity: a distinctive visual language, strong editorial composition, intentional typography, sophisticated spacing and memorable interaction design.

### 7.1 Strictly avoid
Generic glassmorphism · excessive translucent cards · huge rounded cards everywhere · floating gradient blobs · purple/blue AI gradients · generic dark-mode SaaS looks · glowing effects · standard dashboard layouts unless genuinely required · "hero + 3 cards + testimonials + CTA" structures · repetitive card grids · excess pills · every element inside a rounded container · predictable centred symmetry · stock-looking illustrations · gradient text · random decorative circles · excessive shadows · default UI-library appearance · cookie-cutter navbar/hero/footer · anything that screams "AI website builder". If a decision is the obvious choice an AI would make, reconsider and choose a more intentional alternative.

### 7.2 Visual system
Develop a complete identity for this product. Typography is editorial and art-directed: unexpected scale differences, strong headline hierarchy, tight and loose tracking where appropriate, editorial text blocks, oversized type where it improves composition, asymmetric placement, controlled line lengths, distinctive section headings, mixed rhythms. Do not use one uniform text style. Use whitespace as a design element. Colour is restrained and sophisticated: start from the documented semantic tokens (Basil green, Mango yellow, Chilli red, Blueberry blue, mint-white and moss-night neutrals) but apply them with restraint, relate them to food and the printed-matter concept below, use contrast instead of gradients and glow, and add at most two supporting neutrals if needed. Components feel custom: cards only when they improve information hierarchy; much content sits directly on the page; use subtle borders, dividers, typography, spacing, texture or unconventional geometry instead of shadows and rounded containers. Depth comes from composition, scale, typography, imagery, layering, spacing and movement — the site must stay interesting with all blur and glow removed.

### 7.3 Art direction concept: "The Kitchen Almanac"
A printed-matter language drawn from where food lives — ledgers, market stalls, food labels, handwritten kitchen notes, rubber stamps, tickets and receipts. Use these devices **purposefully and sparingly**:
- **Rules and columns:** hairline rules, numbered sections, running heads and folios; an asymmetric grid with a narrow **margin column** for handwritten (cursive) annotations that add real information or warmth.
- **Marker highlight:** Mango used as a hand-drawn marker highlight behind key words (never as a default button fill everywhere).
- **Stamp:** Chilli used for urgency and finality ("ENDS IN 12 MIN", "CLOSED") as a slightly rotated text stamp (≤ 2°), always readable and never on dense forms; rotation removed under reduced motion if animated.
- **Label and ticket geometry:** notched or perforated edges for pickup codes and listing "tickets"; nutrition-label-style ruled tables for data instead of cards.
- **Paper:** warm, mint-tinted paper background with a very subtle grain texture; no blur.
- **Index tabs:** navigation as tabs, a left "spine" rail on desktop and a bottom tab strip on mobile — not pill navbars.
- **Imagery:** no stock photos. Use users' own photos (cropped editorially), a carefully drawn duotone/linocut-style SVG illustration language you create and review for quality, the single 3D still-life, and type-led compositions. Where a real photo would be needed and none exists, use a clearly intentional tonal block, never a fake photo.
Annotations and stamps are decorative or carry the same text as nearby visible content; hide purely decorative ones from assistive technology; contrast rules stay.

### 7.4 Page-by-page compositions (each page type has a different design)
| Page | Composition |
|------|-------------|
| Landing | Magazine cover: oversized masthead type, asymmetric columns, one 3D still-life that responds to scroll, a "contents" index, numbered chapters, full-width moments, the events chapter as a horizontal day-timeline strip |
| Sign up / Log in | Typographic poster beside a printed-form layout; sign-up is a numbered form, log-in is minimal; mobile is form-first with a collapsing masthead |
| Welcome | A "passport" checklist spread |
| Home (My Kitchen) | A ledger: "Use This First" as a ruled shelf list, today's agenda column with margin notes, statistics as large typographic figures — no card grid |
| My Food | Dense ruled table on desktop, row list on mobile; user-switchable density and view modes; freshness as stamp + icon + text; inline text filters instead of pills |
| Add Food | Full-screen viewfinder with crop marks; the confirmation screen as a label proof sheet with confidence marks |
| Available Food | **Map-first application layout**: map fills the screen; list as a classifieds-style rail; on mobile a snap-point bottom drawer with a list/map toggle; pins as small flags; countdown tickets |
| Listing detail | Magazine article spread: editorial photo crop, pull-quote, details as a definition list, contact reveal as a tear-off ticket |
| Create listing | A folding form document with numbered steps and a live "ticket preview" beside it; the window picker as a horizontal time ruler |
| Requests and pickup | Ticket flow; the pickup code as a large perforated ticket |
| Events | Programme/agenda layout with the day's timeline; separate host and organisation views |
| Recipes | Cookbook spread: ingredients column with have/need marks, large numbered steps, index by ingredient |
| Nutrition | A data journal using nutrition-label tables and sliders |
| Waste guide | A sorting-guide poster and decision flow; bin colours always paired with words and icons |
| Impact | Annual-report style: giant numerals, sparse charts, narrative sentences; badges as a stamp collection |
| Organisations | Folder-tab document checklist for applications; directory entries as letterheads with the verified seal |
| Help / FAQ | Printed manual: A–Z index, numbered entries, live search, ruled accordion rows |
| Contact | Correspondence layout (letter form) with "Technical support: Coming soon" as a notice slip |
| Team | A colophon/credits page: typographic list, no photos, no contact details |
| Legal | Long-form reading layout with a side table of contents and a narrow measure |
| Profile / Settings | A preferences sheet with an index at the left; danger zone as a bordered notice |
| Notifications | A chronological log |
| Admin | A separate **utilitarian mode**: dense, monochrome, tabular, no marginalia or motion, visibly distinct from the public site |
| 404 / error | Typography-led with the small bowl mark; helpful links |
Provide real, user-switchable **options** where they help (list/table/map/density views in My Food and Available Food), not one fixed layout.

### 7.5 Composition rules
Mix asymmetric layouts, editorial compositions, offset elements, controlled overlap, narrow columns and full-width moments, large-scale type, unexpected alignment and visual tension. The layout should feel designed, not assembled from components.

### 7.6 Interaction and motion
Restraint and purpose: elegant entrance transitions, scroll-based reveals, subtle parallax where appropriate, sophisticated hover states, image transitions, typographic movement, micro-interactions, layered transitions and section-to-section continuity. Motion communicates hierarchy and craft; nothing is a stock animation preset. Honour reduced motion and the in-app Reduce-animations toggle; the 3D still-life follows the tier, FPS and data-saver rules.

### 7.7 Responsive design
Do not shrink the desktop layout. Rethink typography scale, element positions, navigation (bottom tab strip, collapsing masthead), image crops, section spacing, content hierarchy and interactive elements so mobile feels deliberately designed.

### 7.8 Design Quality Test (run per phase and at the end)
Ask: "If I removed the branding and showed this site to someone, would they say it looks AI-generated?" If yes, redesign the responsible areas. Then run the **anti-pattern audit** and record it in `docs/DESIGN-REVIEW.md`: create `scripts/design-lint.mjs` that fails the build when it finds `backdrop-filter`, blur utilities used for glass, gradient text, `rounded-3xl`/`rounded-full` outside avatars and switches, shadow utilities beyond one subtle menu shadow, or card components used more than twice on any page; also review screenshots for symmetry, repetition and default-library looks.

## 8. Definition of done
Everything in §3 works against local Supabase; all gates in §2.5 pass; demo accounts let a reviewer try every role; docs are updated; no secrets in the repository; the Design Quality Test passes; the final report lists everything unfinished.

## 9. Final report (also saved as `docs/FINAL-REPORT.md`)
Summary in plain language · what works (by phase, with how to try it) · test and gate results · decisions made · placeholders and items needing a human decision or source · anything that needs a key (see `docs/API_KEYS.md`) · known issues and next steps · exact commands to run the app.

## Appendix A — Optional integrations to document in `docs/API_KEYS.md` (all blank by default)
Required for a live deployment: Supabase URL + publishable + secret keys · Cloudflare Turnstile site/secret · Upstash Redis URL/token · Resend or Brevo key (or SMTP) · map tile provider key (inside `NEXT_PUBLIC_MAP_TILE_URL`) · Sentry DSN · `ADMIN_ALERT_EMAIL` · Google OAuth client ID/secret (set in the Supabase dashboard) · self-generated `IP_HASH_SALT`, `INTERNAL_CRON_SECRET` and VAPID keys.
Optional: USDA FoodData Central API key · Open Food Facts (no key; set a User-Agent) · OpenRouteService key (road distance and travel time) · Geoapify or LocationIQ (alternative geocoding/places) · data.gov.in API key (open datasets such as PIN codes) · TheMealDB, Spoonacular or Edamam (recipe/nutrition supplements, check licence terms) · cloud vision fallback (Google AI Studio/Gemini, Hugging Face, or Google Cloud Vision; off by default; never send user photos without explicit consent) · OneSignal or Firebase Cloud Messaging (future native-app push) · analytics alternatives (Plausible, Umami, PostHog) · UptimeRobot or Better Stack (uptime) · Cloudflare Access (admin hardening once a domain exists).
Not used and why: Google Maps Platform and Mapbox (billing), SMS/OTP providers (cost), WhatsApp Business API (business verification and cost), payment gateways (out of scope).