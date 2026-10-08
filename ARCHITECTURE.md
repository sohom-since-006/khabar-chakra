# ARCHITECTURE — Khabar Chakra (খাবার চক্র)

> **Version 1.1** · Status: **Final draft, usable directly** · Supersedes v1.0.
> Depends on PRD v1.1, TRD v1.1, BACKEND SCHEMA v1.1, DESIGN SYSTEM v1.1, TESTING v1.1. Feeds SECURITY, CODE_STYLE, AGENTS. Binding decisions: AGENTS.md §2.
> **Purpose:** how the system fits together, where code lives, how data flows, and the rules that keep it private, cheap and testable. No code in this document.

## 0. What changed since v1.0
Next.js 16 line (`proxy.ts` replaces `middleware.ts`) · diagrams replaced by step lists and tables · jobs confirmed as internal web-app routes · admin location under the locale routes (404 parity) · two-admin flow · map architecture for West Bengal · schema changes folded in · open items closed.

## 1. Drivers
| Driver | Consequence |
|--------|-------------|
| Zero cost | Free tiers only; one deployable web app; no always-on servers |
| Privacy of contacts, locations, documents | Enforced in Postgres (access rules + privileged functions), never only in the UI |
| Time-boxed listings (≤ 48 h) | Time checked at read time; scheduled jobs are housekeeping |
| Low-end phones, patchy networks | Lazy loading, tiered visuals, on-device AI in workers, offline shell |
| Small student team + AI code generation | Few moving parts, one language, strict import boundaries, generated database types |
| Public repository | No secrets, admin identities or real data in code |
| Testability | Pure domain logic, injectable clock, deterministic jobs |

## 2. System Context (who talks to whom)
| From | To | How |
|------|----|-----|
| Users (visitor, member, business, organisation, 4 admins) | Browser app (installable PWA) | HTTPS |
| Browser app | Next.js server on Vercel | Pages, route handlers |
| Browser app | Supabase Auth, Postgres (under access rules), Storage, Realtime | Session cookie / anon key |
| Browser app | Web Workers | OCR and food classifier, on the device |
| Next.js server | Postgres, Storage | User session, or service role only in approved modules |
| Next.js server | Open Food Facts, geocoder, Overpass, email provider, Upstash, Turnstile | Server-side only, cached |
| Supabase scheduler (pg_cron + pg_net) | Postgres (SQL jobs) and Next.js internal job routes | Secret header |
| GitHub Actions | `/api/health`, CI, fallback job calls | Scheduled |
| Browser vendors | Web Push delivery | VAPID |

## 3. Runtime Components
| Component | Runs on | Responsibility |
|-----------|---------|----------------|
| React UI | Browser | Screens, forms, map, camera, charts |
| Web Workers | Browser | OCR and classifier, never block the main thread |
| Service worker | Browser | Offline shell, caching rules, push display |
| Live background | Browser | Tier manager (3D / light / static) + FPS watchdog |
| Next.js server | Vercel (Node runtime) | Server components, route handlers, internal job routes, signed-URL issuing, request interception in **`proxy.ts`** (locale routing, session refresh, request ID) |
| Supabase Auth | Supabase | Accounts, verification, reset, OAuth, MFA (admins) |
| Postgres + PostGIS | Supabase (Mumbai) | System of record, access rules, privileged functions, geo queries, SQL jobs |
| Storage | Supabase | Public and private buckets |
| Realtime | Supabase | Notifications and listing changes (row-filtered) |
| pg_cron + pg_net | Supabase | Time-based SQL jobs; trigger internal job routes |
| Upstash, Resend/Brevo, Turnstile, Sentry | External | Rate limiting, email, bot checks, error reports |
| GitHub Actions | GitHub | CI, keep-alive |

## 4. Code Architecture
### 4.1 Layers (upper layers depend on lower ones, never the reverse)
| Layer | Folder | Rule |
|-------|--------|------|
| Routes | `src/app` | Thin: compose features, fetch data, set metadata; no business logic |
| Features (vertical slices) | `src/features/<name>` | Own components, hooks, queries, actions, schemas; expose a public entry point |
| Shared UI | `src/components` | Design-system components; never import features |
| Shared library | `src/lib` | Supabase clients, environment validation, logging, errors, rate limiting, time, geo, fonts, motion |
| Domain | `src/domain` | **Pure TypeScript**: freshness, risk, dates, nutrition, matching, ladder, units; imports nothing from the app |
| Contracts | `src/types`, shared schemas | Generated database types; validation schemas shared by client and server |

### 4.2 Import rules (enforced by lint)
`domain` imports nothing outside itself · `components` may use `lib` and `domain`, never `features` · a feature may use another feature only through its public entry point · modules that touch secrets are server-only · the service-role client may be imported only by the approved modules listed in SECURITY §6.3 · `app` may import features, never the reverse.

### 4.3 Feature slices
auth · profile · inventory · capture (camera, OCR, barcode, classifier) · recipes · nutrition · listings · requests (request, approve, pickup code) · events · organizations · emergency · waste · impact · notifications · help (FAQ, articles, contact) · admin · landing.

## 5. Repository Layout
- `src/app`: `[locale]` pages grouped as marketing (landing, team, help, faq, contact, legal), auth (login, signup, forgot/reset password, verify email), app (home, food, add food, buy-check, recipes, nutrition, available, listings, requests, events, emergency, waste, impact, notifications, profile, settings, organization apply/status) and **admin**; `api` route handlers; `auth/callback`; manifest, robots, sitemap; the request-interception file **`proxy.ts`**.
- `src/features`, `src/components`, `src/domain`, `src/lib`, `src/workers` (OCR, classifier), `src/styles` (tokens), `src/types`.
- `messages` (en, bn, hi) · `supabase` (migrations, seed with separate reference and demo sets, database tests) · `tests` (unit, component, api, e2e, fixtures, factories, helpers) · `public` (icons, 3D models, illustrations) · `scripts` (seeding, places import, contrast and i18n checks) · `docs` · `.github/workflows`.

## 6. Read and Write Paths
| Operation | Path | Why |
|-----------|------|-----|
| Simple reads/writes on the user's own rows | Browser or server Supabase client under the user's session (access rules apply) | Fewest moving parts |
| Public content (FAQ, help, waste guide, recipes) | Server components, cached | Fast, SEO-friendly |
| **Sensitive or abusable actions** (reveal contact, publish listing, request, approve, complete pickup, contact form, uploads) | Browser → route handler (validate, rate-limit, Turnstile if needed) → **privileged function called with the user's session** | Adds limits without extra privilege |
| Privileged server work (signed URLs, push sending, audit writes, document byte checks, contact-form inserts) | Route handler → service role in approved modules only | Needs elevated rights |
| Time-based work | SQL jobs; or scheduler → internal job route | Runs without a user |
| Live updates | Realtime with row filtering | No polling |
**Rule:** the service role is never used on a path that accepts a user-supplied ID without an explicit authorisation check. User-visible rules live in SQL; route handlers add rate limits, validation and orchestration.

## 7. Key Flows
**7.1 Sign-up and verification.** Sign-up form (Turnstile, 18+ confirmation) → Auth creates the user → trigger creates profile, preferences, streak → verification email. Until the email is confirmed, the UI hides post/request/reveal/apply and the database refuses them. Sessions use secure cookies; the server trusts only a validated user lookup.

**7.2 Add food.** Camera/gallery/barcode → compress and strip location data on the device → worker tries barcode, then OCR (dates, FSSAI text and number), then classifier → per-field confidence → **editable confirmation screen** → create-item route (validation, FSSAI flag rules, score computed with the shared domain module) → photo uploaded through a signed URL. Any failure falls back to manual entry.

**7.3 Publish a listing.** Wizard (food → 1–4 photos → pin + window → consent) → photos uploaded via signed URLs and confirmed server-side → publish route → privileged publish function checks photos, window ≤ category maximum ≤ 48 h, cooked-food age, locked category, FSSAI flag, confirmation text version, daily limit → listing becomes open (or scheduled) → Realtime updates the feed → verified organisations within radius are notified.

**7.4 Reveal a contact.** (1) Browser calls the reveal route with its session. (2) The route validates the ID and applies per-user and per-IP rate limits (fails closed). (3) It calls the reveal function with the user's session. (4) The function checks verified email, suspension, live window (read through `app_now()`), visibility rule or approved request, blocks and quotas. (5) It writes the audit row. (6) It returns the contact, or one generic "not available" answer for every denial. (7) The response is `no-store`. The window ends exactly on time even if the expiry job has not run.

**7.5 Request → approval → pickup.** Requester sends a request → donor notified → donor approves → a six-digit pickup code is created, readable only by the donor → requester notified → handover in person → requester enters the code → the completion function checks attempts, expiry and code, completes the request and writes impact for both people.

**7.6 Organisation verification (NGO, caterer, banquet hall, authority).** Applicant requests a signed upload URL (type, size) → uploads to the private bucket → the confirm route reads the first bytes (magic-byte check) and records or deletes the file → applicant submits → an admin **claims** the case (30-minute claim) → opens each required document (≤ 60 s link, audited, first-open time recorded) → marks each reviewed → decides. The decision function **refuses approval unless every required document is reviewed**. For a **trusted authority** approval and for **permanent badge revocation/restoration**, the decision creates an approval request that a **different admin** must confirm (72 h); emergency suspension is immediate and reviewed by a second admin within 24 h. The applicant gets an email and in-app notice; the badge appears only from the approved status.

**7.7 Event pre-announcement.** Host/caterer/banquet creates an event (static pin, serving end, expected surplus) → verified organisations nearby see it → an organisation taps "We'll pick up" → at surplus time the host posts an event listing prefilled from the event → normal publish, request and pickup-code flow.

**7.8 Scheduled work and notifications.**
| Job | Trigger | Runs in |
|-----|---------|---------|
| Expire listings, go-live of scheduled listings, expire requests and emergency requests, "15 minutes left" warnings, retention purge | pg_cron every 1–10 minutes / daily | **SQL only** (no HTTP dependency) |
| Recompute freshness and alerts | pg_cron hourly → pg_net → internal job route | Next.js (Node) |
| Dispatch push and email | pg_cron every 5 minutes → pg_net → internal job route | Next.js (Node; push library needs Node) |
| Keep-alive | GitHub Actions daily → health route | — |
Internal job routes accept POST only, no cookies, a constant-time secret check, batches ≤ 500, are idempotent (dedupe keys) and are never linked publicly. GitHub Actions can call the same routes if pg_net is unavailable. Pipeline: a producer adds a notification row → Realtime shows it in-app → the dispatcher sends push/email respecting quiet hours and opt-ins, records delivery times and removes dead push subscriptions.

## 8. Authentication and Authorisation
| Concern | Design |
|---------|--------|
| Identity | Supabase Auth: email + password, Google, verification, reset, change email/password with re-authentication |
| Sessions | HTTP-only cookies; short access token + rotating refresh token; log out of all devices |
| Roles | Account type (intent only) · organisation status and kind (real privileges) · admin table + MFA (admin) |
| Gate 1 UI | Hide what the user cannot do |
| Gate 2 route handler | Validation, rate limit, session check |
| Gate 3 database | Access rules and privileged functions — the **final** authority |
| Verified email | Checked inside the database functions and policies |
| Admin | Admin-table row **and** an MFA session |
| Organisation privileges | Only when the organisation is approved and not suspended; suspension takes effect immediately |
| 18+ | Confirmed at signup and stored as a time stamp only |

## 9. Admin Architecture
- Lives under the **locale routes** (English-only). A request for `/admin` is redirected exactly like any unknown path (for example `/foo` to `/en/foo`) and then returns the **standard 404**, so non-admins cannot tell the difference. Never place admin outside the locale routes.
- The admin layout runs a server check (admin table + MFA); on failure it shows the standard "not found" — never a redirect to login, never "forbidden".
- The "Admin" menu item is rendered server-side only for verified admins; admin code is in its own chunk never sent to non-admins; not in the sitemap or robots file; `noindex` header.
- First entry per session calls the session-start route: writes the audit log and sends an alert email to the address held in server configuration (never in the repository).
- Case handling: claim with auto-release after 30 minutes; a second admin sees "being reviewed by another admin"; approval refused until all required documents are reviewed; documents open only via ≤ 60-second links in a sandboxed viewer (images as images; PDFs rendered by a PDF library in a worker); every open audited without file contents.
- Two-admin rule as in §7.6. Admin accounts cannot be created through the app; the admin table is changed only by SQL run by a database owner. Four admins, each with two authenticator devices.

## 10. Frontend Architecture
**10.1 Rendering.** Landing, FAQ, Help, Team, Legal: static with periodic refresh plus on-demand refresh when an admin edits content · auth pages: dynamic · app pages: dynamic server components with small client islands · Available Food + map: client-side query with short freshness window (~30 s) plus Realtime invalidation, ≤ 100 rows per request with cursor paging · admin: dynamic, never cached.
**10.2 Caching.** Per-user pages are never cached by the server. Service worker: precache shell and static assets; cache-first for fonts, icons and models; stale-while-revalidate for FAQ/help; network-first with read-only fallback for the user's inventory. **Never cache** contact reveals, documents, auth, admin, pickup codes or any private/no-store response.
**10.3 State and forms.** Server data through TanStack Query; local UI state in React; small context stores for theme, motion level and background tier. Forms with React Hook Form and the shared validation schemas.
**10.4 Internationalisation.** next-intl with locale-prefixed routes (the interception file `proxy.ts` hosts its middleware), namespaced messages, ICU plurals; database content picked per language with English fallback; admin English-only.
**10.5 Theming.** Class-based theme from CSS variables with a no-flash script; semantic tokens only.
**10.6 Live background.** A capability check chooses tier T2 (3D, landing only), T1 or T0; the 3D scene is a dynamically loaded chunk after first paint; an FPS watchdog steps down a tier; rendering pauses off-screen or hidden; context loss falls back to T1; always hidden from assistive technology.
**10.7 Camera and on-device AI.** `getUserMedia` on HTTPS, or a file-input fallback; photos compressed on a canvas with location data stripped; workers load models only when Add Food opens and cache them in the service worker; confidence on every result; failures never block manual entry.
**10.8 Map (West Bengal).**
- Leaflet loaded lazily; tiles from the free-tier provider chosen in Phase 4 (OSM's own servers for development only); attribution always visible.
- Feed/map data from a server-side "in view" query: live listings inside the visible rectangle, ≤ 100 rows, using the **public pin**.
- Default centre Asansol; a friendly note outside West Bengal; list view mirrors the map.
- Places layer from the `places` table: curated Asansol list plus per-district OpenStreetMap imports (organisations, recycling, compost, scrap dealers, community gardens) with Bengali names where available; non-partners labelled "Not verified by Khabar Chakra".
- Address search and reverse search go through server routes that call free geocoders, cache results and rate-limit; the pin is always draggable; distances are straight-line from the public pin; directions open in the user's maps app.

## 11. Data, Storage and Delivery
**Storage pipeline.** Listing/food photos: re-encoded on the device (WebP ≤ 300 KB, thumbnail made there) → signed upload URL → upload → confirm route checks magic bytes → record saved. Organisation documents: private bucket; signed upload URL with allowed type and size; confirm route verifies magic bytes and deletes invalid files; viewing only via ≤ 60 s signed links. Avatars and recipe images: public bucket, random paths.
**Realtime scope.** Only notifications, listings, listing requests and emergency requests are published; never contact points, private locations, pickup codes or documents.
**Email and push.** Resend or Brevo for email (transactional first; digests batched under daily caps); Web Push with VAPID keys; in-app notifications are the guaranteed fallback (iOS push only for installed PWAs).

## 12. Cross-Cutting Concerns
Security: layered as in SECURITY.md (CSP with nonces, headers, Turnstile, rate limits, private buckets, audit log) · Configuration: environment values validated at startup, server-only values never exported · Errors: one error type with stable codes; generic messages for sensitive failures · Logging: structured with request IDs; redaction of phone, email, address, tokens, codes, documents; Sentry with PII scrubbing · Feature flags: database table read server-side; off means hidden UI and consistent not-found API · Time: all domain and database code reads time through the injected clock / `app_now()`; jobs take `p_now` · Performance: route splitting; dynamic imports for map, 3D, OCR, charts; image budgets; indexes · Accessibility: Radix primitives, contrast script, axe in CI · i18n: no hard-coded strings.

## 13. Deployment
Developers and AI agents push to GitHub → CI (lint, types, tests, accessibility, Lighthouse, secret scan) → Vercel preview (connected to the **staging** Supabase project) → merge → production on Vercel (connected to the production Supabase project, Mumbai). Database migrations go to staging first, then production with manual approval. A daily keep-alive and a weekly encrypted backup (run from a **separate private repository or private storage**) complete the picture. Environments: local (Supabase CLI), staging, production.

## 14. Failure Modes and Degradation
| Failure | Behaviour |
|---------|-----------|
| Supabase paused or unavailable | Friendly error page; keep-alive prevents pausing; read-only offline inventory |
| Upstash down | Fail **closed** for reveal, signup, contact; open for harmless reads |
| Email limit reached | In-app notifications continue; email queued or dropped with a warning |
| Push fails | Dead subscriptions removed; in-app remains |
| Open Food Facts / geocoder / tiles down | Manual entry, typed address, list view |
| OCR/model slow or failing | Skip to manual entry with a clear message |
| 3D unavailable or slow | Light or static background |
| Vercel job route down | SQL jobs (expiry, windows) still run; freshness and notifications catch up next run |
| Free-tier limits near | Warnings; features degrade, never whole pages |

## 15. Growth Path (still free)
Stay stateless on the web tier; cap query sizes; add indexes before services; move heavy jobs to a small worker if limits bite; the database is plain Postgres + PostGIS and can move to any host; native apps can reuse the same privileged functions and domain logic.

## 16. Architecture Decisions
| ID | Decision | Reason |
|----|----------|--------|
| ADR-10 | Feature-slice structure with enforced import boundaries | Organised, reviewable AI-generated code |
| ADR-11 | Scheduled app logic as internal Next.js routes; time-critical rules in SQL | One runtime; push library needs Node; no duplicated domain code |
| ADR-12 | Sensitive operations: route handler → privileged function with the **user's** session | Limits without extra privilege |
| ADR-13 | Admin under the locale routes, English-only, standard 404 for everyone else | Identical to unknown URLs |
| ADR-14 | Limited Realtime publication | Prevents contact/location leaks |
| ADR-15 | Thumbnails and compression on the device | Free plan has no image transforms |
| ADR-16 | Domain logic has one source | No drift between browser, server and jobs |
| ADR-17 | Next.js 16 conventions: `proxy.ts`, Node 20.9+, keep on latest patch | Current stable line; frequent security releases |
| ADR-18 | Map: Leaflet + OSM data + free-tier tiles; server-side cached geocoding; straight-line distances from public pins | Zero cost, privacy, West Bengal focus |
| ADR-19 | Two-admin rule through an approvals table | Protects high-trust decisions |

## 17. Closed and Open Items
*Closed:* jobs runtime (ADR-11) · backup location (separate private repo or storage) · minimum age 18+ · region Mumbai · two-admin rule · font choice.
*Open:* ARCH-1 exact installed versions of Next.js, next-intl, Tailwind and Supabase libraries recorded in `docs/VERSIONS.md` at project start · ARCH-2 tile provider (Phase 4) · ARCH-3 who holds the backup encryption key.

---
*End of ARCHITECTURE v1.1.*