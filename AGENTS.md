# AGENTS.md — Instructions for AI Coding Assistants

> **Version 1.1 · Status: Final, usable directly.** Audience: any AI coding agent (Claude Code, Codex, Cursor, Copilot, etc.) working in this repository.
> **Project:** Khabar Chakra (খাবার চক্র) — a free, community food-lifecycle website: track freshness → share surplus (homes, weddings, events) for a limited time → handle waste responsibly.
> **Humans:** The S-QUAD (students). They rely on you for most of the code, so correctness, safety and plain-language explanations matter more than speed.
> If your tool looks for `CLAUDE.md` or `.cursorrules`, create a one-line file that points here. Keep this file as the single source of truth.

---

## 0. Read This First
1. **Do not write application code until a human says "Start Phase N".** Until then, only documents change.
2. **Cost must stay ₹0.** No paid service, API, tier or dependency. If something needs money, stop and ask.
3. **Privacy and safety rules are enforced in the database and server, never only in the UI.**
4. **Never certify food as safe.** The recipient decides.
5. **No secrets, admin identities or real personal data in the repo** (it becomes public).
6. **Every change ships with tests and updated docs.**
7. **Do not invent facts** (shelf-life numbers, CO₂e factors, prices, laws, library APIs). Use marked placeholders or check the docs of the installed version.
8. **When a decision belongs to the humans, ask. Otherwise decide, say so in one line, and continue.**

---

## 1. Documents and Precedence
Read the relevant documents (in `docs/`) before coding.

| Document | Use it for |
|----------|-----------|
| PRD.md (v1.1) | What to build; requirement IDs (`FR-…`) |
| TRD.md | Stack, algorithms, integrations, budgets |
| BACKEND SCHEMA.md | Tables, enums, access rules, RPCs, jobs, storage |
| ARCHITECTURE.md | System design, folders, flows, ADRs |
| DESIGN SYSTEM.md (+ Update v1.1) | Palette, fonts, components, motion |
| SECURITY.md | Threat model and rules |
| TESTING.md | Test strategy and gates |
| CODE_STYLE.md | Coding conventions |

**If documents disagree**, use this order and flag the conflict in your report: (1) §2 below · (2) SECURITY.md · (3) BACKEND SCHEMA.md · (4) TRD.md · (5) PRD.md.

---

## 2. Binding Decisions
| # | Decision |
|---|----------|
| D1 | Map pins are **static**, chosen when posting. **No live GPS tracking.** |
| D2 | A donor's pickup contact is visible to **logged-in, email-verified users during the availability window** (donor may instead choose "only after I approve"). Exact location follows the donor's `exact` / `approximate` choice. Access only through `reveal_contact()` and RLS. |
| D3 | Availability window is admin-adjustable **up to a hard 48-hour ceiling** enforced in the database. Cooked food has much lower limits. |
| D4 | **1–4 photos required** to publish any listing; strip EXIF/location on the device. |
| D5 | **Event mode:** pre-announce events to verified organisations; event-linked listings; **pickup code**. |
| D6 | Contact-form messages go to an **admin inbox**; no team email/phone shown; **Technical support shows "Coming soon"** (controlled by `site_settings.public_contact`). |
| D7 | Cooked food and any other food may be listed, except D8. |
| D8 | **Raw meat, fish and eggs (`meat_fish_egg`)**: trackable in inventory, **never** listable/shareable/donatable/swappable. Locked in v1 (not admin-adjustable). Cooked dishes containing them are `cooked_food` and listable. |
| D9 | **Verified badges** (green leaf-tick, tooltip on hover/focus/tap) for approved **NGOs, caterers, banquet halls and trusted authorities**. Documents required; the admin must open every required document before approving. The badge means documents were reviewed, **not** that food is safe. |
| D10 | **Four admins.** No admin login page: normal login → hidden "Admin" menu (server-verified) → authenticator (TOTP) step-up. Everyone else gets the same 404 as an unknown URL. Admin identity lives only in `admin_users`, never in code. |
| D11 | **Available Food** shows all listable items in one place; **default order: ending soonest, then nearest**. |
| D12 | **Emergency Food Sharing** is for **verified NGOs only**; authorities and caterers have no special emergency powers. |
| D13 | Footer ends with **"Made by The S-QUAD"** linking to the Team page, which shows the four members' names, titles and bios, **no contact details**, plain-text names. |
| D14 | **English first**; Bengali and Hindi in Phase 6; all text lives in message files from day one. |
| D15 | **Backups never stored as artifacts in the public repo**; use a separate private repo or private storage. |
| D16 | Repo becomes public later; domain decided later; use `*.vercel.app` and keep the site URL in `NEXT_PUBLIC_SITE_URL`. |
| D17 | Scheduled-job functions take `p_now timestamptz default now()`; time is read via `app_now()` so time logic is testable. |
| D18 | **Hindi removed from the logo**; Hindi appears only as translated UI text (खाना चक्र). |
| D19 | **Website palette "Market Fresh"** (Basil, Mango, Chilli, Blueberry, mint/moss neutrals), independent of the logo. |
| D20 | **18+ only** (Terms and signup confirmation). |
| D21 | **Two-admin rule:** approving a trusted authority and permanently revoking/restoring any badge need a second admin within 72 h. One admin may suspend immediately in an emergency; a second reviews within 24 h. |
| D22 | Supabase region **Mumbai**. |
| D23 | Scheduled app jobs run as **internal Next.js routes** (`/api/internal/jobs/*`) triggered by pg_cron + pg_net (fallback GitHub Actions). Time-critical rules stay in SQL. No Supabase Edge Functions in v1. |
| D24 | Map: Leaflet + OpenStreetMap data + a free-tier tile provider chosen in Phase 4; default centre Asansol; West Bengal focus; geocoding called server-side and cached; directions via external maps links. Fonts final: **Caveat** (cursive) + **Nunito**. |

Add new decisions as D25, D26… with a date.

---

## 3. Non-Negotiable Rules
### 3.1 Cost
Use only free tiers or open-source tools listed in TRD. Optional things that could cost money (for example Google Vision fallback) are off by default behind a flag with a hard cap.

### 3.2 Security and privacy
- **RLS on every table** in `public`; a table without policies and tests is an unfinished task.
- Service-role key, VAPID private key and cron secret are **server-only** (`import 'server-only'`); the service-role client is imported only by the approved modules in SECURITY §6.3.
- Contacts and exact locations are returned only through the rules in BACKEND SCHEMA (§8.3, §8.4, §8.9). Never expose them via another query, view, Realtime channel, log, error, push, email or cache.
- Sensitive operations: browser → route handler (validate, rate-limit) → **RPC called with the user's session**. Never use the service role to "make it work".
- Every `SECURITY DEFINER` function sets `search_path`, validates `auth.uid()`, and has `EXECUTE` revoked from `PUBLIC`/`anon` and granted to `authenticated`.
- Do not log phone numbers, emails, addresses, document data, tokens or codes.
- Validate all input with shared Zod schemas **on the server**.
- Listing text fields reject or mask phone numbers and emails.
- Admin code is never sent to non-admins; non-admins get the standard 404.
- Never reveal whether an email, listing, contact or admin page exists through different errors.
- Sanitise user text and Markdown; no `dangerouslySetInnerHTML` without sanitising.
- Uploads: MIME + magic-byte checks, size limits, UUID names; documents only in the private bucket.
- Preview deployments use **staging** keys and data, never production.
- **Public repo:** no real emails, phones, keys, admin identities or production URLs with secrets. Use `example.com` and `+91 90000 0xxxx` in fixtures.

### 3.3 Food safety and honesty
- Never write copy that says or implies the team certifies, guarantees or inspects food. Use "You decide whether the food is safe to accept."
- Never auto-select **veg** for a donation; the donor chooses.
- AI/OCR output is a suggestion: always show the editable confirmation screen.
- FSSAI handling is **flag-and-guide**, never "reject" or "we file complaints for you".
- Tone: warm, concrete, local; no guilt or dark patterns.

### 3.4 Data integrity
- Never edit a merged migration; add a new one.
- Never weaken a constraint, policy or test to make something pass; if a rule seems wrong, stop and ask.
- Impact and notification writes are idempotent.
- Timestamps in UTC; display in the user's zone (default `Asia/Kolkata`).

### 3.5 Facts and placeholders
Do not invent shelf-life hours, CO₂e factors, prices, legal wording, nutrition values or recycling rules. Add a clearly marked placeholder (`TODO(source): …`) and list it in your report.

---

## 4. Tech Stack at a Glance
Next.js (App Router) + React + TypeScript `strict` · Tailwind CSS + shadcn/ui · Framer Motion · three.js (react-three-fiber) for the landing background · Supabase (Postgres + PostGIS, Auth, Storage, Realtime, pg_cron + pg_net) · Leaflet + OpenStreetMap-based tiles · Tesseract.js + barcode detector + small on-device classifier · Open Food Facts · next-intl · TanStack Query · React Hook Form + Zod · Vitest, Playwright, pgTAP, axe, Lighthouse CI.

**Versions (research as of 2026):** the framework is on the **Next.js 16** line, where `middleware.ts` is renamed **`proxy.ts`** (Node runtime by default), Node.js **20.9+** is required, and next-intl v4 uses `createMiddleware` inside `proxy.ts`. Security releases are frequent: keep Next.js on the latest patch and apply security releases within 48 hours.
**Version rule:** at project start, create the app with the current `create-next-app`, record exact versions in `docs/VERSIONS.md`, and **read the documentation of the installed versions** before using any API. Never rely on memory for APIs that changed between majors.

**Theme (Market Fresh):** Basil 700 `#0B6E3C` (primary), Mango `#FFC93C` (accent), Chilli 600 `#D6381F` (urgency/errors), Blueberry 700 `#2457A6` (information), background `#FAFDF6`, dark background `#0A1912`. **Fonts:** Caveat (short cursive accents) + Nunito; Bengali Atma/Hind Siliguri; Hindi Kalam/Hind. Use semantic tokens only.

---

## 5. Commands
`npm install` · `npm run db:start` · `db:reset` · `db:types` · `dev` (`dev:https` for phone camera tests) · `lint` · `typecheck` · `test` · `test:db` · `test:e2e` · `test:a11y` · `build`.
Before saying a task is done run lint, typecheck, tests, and (if SQL/policies changed) `test:db`, and (if UI flows changed) the relevant E2E specs. If you cannot run something, say so.

---

## 6. How to Work
### 6.1 Phases (PRD §4)
1 Foundation · 2 Scan & Track · 3 Alerts, Recipes, Nutrition · 4 Share & Community (listings, map, events, organisations, admin, emergency) · 5 Waste & Impact · 6 Polish & Launch. **Do not start a later phase early.**

### 6.2 Task loop
1. Understand: restate the goal and acceptance criteria (3–6 lines).
2. Check §2, §3 and §7.
3. Plan: files to add/change; small steps.
4. Write tests alongside (IDs from TESTING.md); database rules get pgTAP tests.
5. Implement following CODE_STYLE.md.
6. Verify with the commands in §5.
7. Update docs in the same change.
8. Report using §10.

### 6.3 Change hygiene
One logical change per pull request; no drive-by refactors; no folder restructuring without approval; for any new dependency state purpose, licence, bundle impact, maintenance status and the free alternative considered.

---

## 7. Ask the Humans First
Stop and ask (with a recommended default) for: anything paid or billing-based · changes to §2 or to the verified-badge or admin model · loosening any privacy rule · enabling raw meat/fish/egg listing, raising any window above 48 h, or relaxing cooked-food limits · legal text, government/NGO procedures, anything resembling legal or medical advice · unsourced data (shelf life, CO₂e, prices, nutrition, recycling rules) · brand changes (logo, name, mascot name, licence) · destructive operations · real credentials or production access.
**Do not ask** about variable names, file placement within the agreed structure, ordinary spacing, equivalent standard libraries already in the stack, or small copy tweaks.

---

## 8. Implementation Guidance (summary; details in ARCHITECTURE and CODE_STYLE)
- **Server vs client:** server components by default; three Supabase clients (browser, server, admin/service); simple own-row CRUD under RLS; sensitive/privileged work via route handlers and RPCs.
- **Domain logic** (`src/domain`): pure TypeScript, shared by browser, server and jobs, using the golden vectors in TESTING §6; half-up rounding; no direct `Date.now()`.
- **Validation and errors:** one Zod schema per input; stable error codes; generic messages for sensitive failures; error body from TRD §7.1.
- **Internationalisation:** no hard-coded UI strings; `next-intl` keys; plan for +40% text; Indian formats.
- **Design:** semantic tokens only; status = colour + icon + text; one shared `VerifiedBadge`; touch targets ≥ 44 px; focus ring from tokens; cursive accent only for short decorative text.
- **Live background:** separate lazy chunk on the landing page only; capability detection and FPS watchdog; static fallback; budgets in TRD §4.2.
- **AI capture:** models load only when Add Food opens, run in a Web Worker, results editable, failures fall back to manual entry.
- **Database:** forward-only migrations; RLS in the same migration as the table; jobs take `p_now`; demo data never in production.
- **Jobs:** SQL jobs for time-critical rules; internal Next.js routes (secret header, POST only, batched, idempotent) for freshness and notification dispatch.
- **Admin:** under `src/app/[locale]/admin`, English-only, server-guarded (`admin_users` + MFA), `notFound()` for everyone else, claim system, 60-second signed document links, every action audited, two-admin rule (D21).
- **Map:** default centre Asansol; list-view alternative; places from open data + curated list; server-side geocoding with cache; distances computed from the public pin only.

---

## 9. Git
Branches `feat/<area>-<name>`, `fix/…`, `docs/…`, `chore/…`. Conventional Commits. Never commit to `main` directly or force-push shared branches. PR description: summary, requirement IDs, screenshots (light + dark), test evidence, migrations (yes/no), docs updated (yes/no), items needing a decision. Never commit `.env*` (except `.env.example`), keys, real personal data or build output.

---

## 10. Final Report Template
```
## Summary (2–4 plain sentences)
## Requirements covered (FR-/TC- IDs)
## Files changed (one line each)
## How I verified (commands + results; what I could not run and why)
## Decisions I made (one line each)
## Conflicts or risks spotted
## Needs a human decision or source
## Next suggested step
```

---

## 11. Definition of Done
- [ ] Acceptance criteria met and demonstrable.
- [ ] Tests added/updated at the right level and passing; none skipped or weakened.
- [ ] RLS/policies/constraints exist and are tested for any data change.
- [ ] No hard-coded strings or hex colours; works in Light and Dark; no colour-only meaning.
- [ ] Axe shows no serious/critical issues on touched pages; keyboard path works.
- [ ] Performance budgets respected.
- [ ] No secrets, PII or admin identifiers in code, logs, fixtures or docs.
- [ ] Docs updated; report written; placeholders and open questions listed.

---

## 12. Known Placeholders and Open Items
| Item | Status |
|------|--------|
| CO₂e per kg of food avoided: value + citation | Pending |
| Shelf-life defaults and sources | Pending team review |
| Rupee price per kg by category | Placeholder values |
| Free map-tile provider and attribution | Decide in Phase 4 |
| Logo: trace to SVG without the Hindi line; dark-mode lockup | To do |
| Public contact email/phone; technical support | **Coming soon** (shown as such) |
| Privacy/grievance contact before launch | Needed; interim = contact-form topic + admin inbox |
| Terms, Privacy Policy, Food-Safety Disclaimer | Drafts need expert legal review |
| Licence | MIT proposed for code; brand assets not licensed; confirm before going public |
| 3D food models and illustration set; mascot name | To be created/decided |
| FSSAI veg/non-veg/egg symbol specs | Verify before final art |
| Owners of Supabase/Vercel/GitHub accounts; backup-key holders | Team to decide |

---

## 13. Glossary
**Band** freshness status (green/amber/red/expired) · **Window** donor-chosen period (≤ 48 h) when a listing is live · **Listing kind** donate/share/swap/event_surplus · **Reveal** showing a contact through `reveal_contact()` · **Pickup code** 6-digit code the donor sees and the recipient enters · **Verified** organisation approved by an admin after document review · **Use This First** shelf of items to eat earliest · **Static pin** one chosen map location · **4R loop** Scan → Track → Rescue → Recycle · **S-QUAD** the student team.

## 14. If You Are Unsure
Choose the safer, more private, more reversible, lower-cost option; make that choice visible in your report; ask before doing anything that cannot be undone. Silence is never permission to loosen §2 or §3.