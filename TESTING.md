# TESTING — Khabar Chakra (খাবার চক্র)

> **Version 1.1** · Status: **Final draft, usable directly** · Supersedes v1.0.
> Depends on PRD v1.1, TRD v1.1, BACKEND SCHEMA v1.1, ARCHITECTURE, SECURITY. Feeds README, AGENTS, CODE_STYLE.
> **Cost rule:** every tool here is free or open source.

## 0. What changed since v1.0
Added tests for: required listing photos · 48-hour ceiling and locked meat/fish/egg · free-text phone/email rejection · reveal quotas and new-account throttle · distances from the public pin · four organisation kinds with per-kind documents · two-admin rule and emergency suspension · hidden admin entry with identical 404 after the locale redirect · internal job routes · Realtime publication contents · function grants · CSP headers · 18+ confirmation · West Bengal map behaviour · Market Fresh contrast. Code examples removed (documentation only).

## 1. Principles
| # | Principle |
|---|-----------|
| T1 | **Test the risks first:** privacy (contacts, locations, documents), food-safety rules, admin access, the 48-hour window. |
| T2 | **Enforce rules where they cannot be bypassed:** every business rule is tested at database/server level, never only in the UI. |
| T3 | **Deterministic time:** clock-dependent behaviour is tested with a controlled clock, never sleeping. |
| T4 | **Every bug gets a regression test.** |
| T5 | **Fast feedback:** pull-request pipeline ≤ 10 minutes; slow suites run nightly. |
| T6 | **Honest AI testing:** OCR/classifier quality is measured on a real photo set; users always confirm results. |
| T7 | **Accessibility and performance are failures, not polish.** |
| T8 | **Tests are documentation:** names carry the requirement ID. |

## 2. Test Types and Tools
| Layer | Tool (free) | Covers | Runs |
|-------|-------------|--------|------|
| Static | ESLint (a11y, security, boundaries, no-hard-coded-strings), TypeScript strict, Prettier | Style, safety, import boundaries, i18n discipline | every commit/PR |
| Unit | Vitest + fast-check | Pure domain logic: freshness, risk, dates, nutrition, ranking, validators | PR |
| Component | Vitest + React Testing Library + user-event, MSW | Forms, cards, badge tooltip, FAQ accordion, status chips | PR |
| Database | pgTAP via `supabase test db` | Constraints, access rules, RPCs, triggers, job functions | PR |
| API | Vitest against local Supabase | Guards, validation, rate limits, error shapes, IDOR, internal job routes | PR |
| End-to-end | Playwright (Chromium, Firefox, WebKit; Pixel 5 and iPhone 13 emulation; fake camera) | Whole journeys, multi-user flows | PR smoke, nightly full |
| Accessibility | axe via Playwright, keyboard-only journeys, manual screen-reader pass | WCAG 2.1 AA, both themes | PR (axe), release (manual) |
| Visual regression | Playwright screenshots | Design-system components, badge, cards, empty/error states, light/dark | PR key set, nightly all |
| Performance | Lighthouse CI, size-limit, performance traces | Budgets, 3D chunk isolation, FPS watchdog | PR budgets, nightly |
| Security | OWASP ZAP baseline, gitleaks, npm audit, RLS matrix automation, header checks | Injection, XSS, IDOR, secrets, headers, grants | PR (secrets/audit), nightly (ZAP) |
| Load | k6 | Feed/map queries, reveal, matching | before release |
| AI quality | Custom script + labelled photo set | OCR, dates, barcode, classifier, calibration | on model change and release |
| Manual/UAT | Checklists in §12 | Real devices, usability, pilot | release |

## 3. Environments and Data
**Environments:** local (Supabase CLI), CI (ephemeral), staging (free project), production (read-only smoke only).
**Deterministic time:** frontend/server tests use fake timers; the database exposes `app_now()` and every job takes `p_now`, so tests can simulate "one second after the window ends" without waiting. Time-zone assertions use Asia/Kolkata.
**Standard test accounts** (created only in local/staging seeds): member_verified · member_unverified · member_far (40 km) · member_blocker/member_blocked · member_new_24h (account younger than a day) · donor_home · adult_unconfirmed (never confirmed 18+) · caterer_unverified/caterer_verified · banquet_verified · authority_pending/authority_verified · ngo_draft/ngo_pending/ngo_needs_info/ngo_approved/ngo_suspended · admin_1…admin_4 (MFA enrolled, test secrets) · admin_no_mfa.
**Factories and fixtures:** data builders with Indian locale; fixture photos and documents (including an oversize file, a renamed executable and a polyglot file); **no real personal data**; phone numbers use the fictitious pattern `+91 90000 0xxxx`.

## 4. Quality Gates (all must pass to merge/release)
Lint and typecheck 0 errors · unit/component 100% pass · `src/domain` coverage ≥ 95% lines and ≥ 90% branches · overall ≥ 70% lines · pgTAP 100% pass **and every table has at least one "allowed" and one "denied" test** · E2E smoke 100% (at most one automatic retry; retried tests are reported as flaky) · axe: 0 serious/critical on key pages in light and dark · Lighthouse mobile: Performance ≥ 80, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90, LCP ≤ 3.0 s, CLS ≤ 0.1 · bundle: app routes ≤ 200 KB gz, 3D chunk ≤ 500 KB gz and absent from non-landing routes · security: no high/critical audit findings, gitleaks clean, ZAP baseline 0 high, **service-role key, VAPID private key and cron secret absent from the client bundle** · i18n: no missing English keys, no hard-coded strings · contrast script green for every token pair in both themes · release only: manual checklist §12.

## 5. IDs and Traceability
IDs: `TC-<AREA>-<NNN>` with AREA = AUTH, ADD, FSSAI, TRACK, BUY, RECIPE, NUT, LIST, PRIV, REQ, EVENT, NGO, BADGE, ADMIN, WASTE, IMPACT, MAP, HELP, SITE, I18N, PWA, PERF, A11Y, SEC, DATA, RES. Test titles start with the ID and the requirement (for example "TC-LIST-014 [FR-SHARE-3] …"). A generated report maps PRD requirement IDs to test IDs and fails the build if a **Must** requirement has no test.

## 6. Domain Logic Tests (golden vectors)
Rounding: half up. The same vectors are used by browser, server and jobs.

### 6.1 Freshness score (TRD §5.2)
Effective amber = amber × weight; effective red = red × weight.
| Case | amber / red hours · weight | Hours remaining | Score | Band |
|------|----------------------------|-----------------|-------|------|
| Leafy vegetables, plenty of time | 48 / 24 · 1.0 | 100 | 86 | green |
| At amber boundary | 48 / 24 · 1.0 | 48 | 69 | amber |
| Mid amber | 48 / 24 · 1.0 | 36 | 55 | amber |
| At red boundary | 48 / 24 · 1.0 | 24 | 39 | red |
| Half-way through red | 48 / 24 · 1.0 | 12 | 20 | red |
| Expired | 48 / 24 · 1.0 | 0 | 0 | expired |
| Past deadline | 48 / 24 · 1.0 | −5 | 0 | expired |
| Milk, amber | 48 / 24 · 1.3 | 40 | 48 | amber |
| Milk at amber boundary | 48 / 24 · 1.3 | 62.4 | 69 | amber |
| Cooked rice, just green | 12 / 6 · 1.5 | 20 | 72 | green |
| Very long shelf life | 48 / 24 · 1.0 | 10 000 | 100 | green |
| No deadline known | — | — | 85, low-confidence flag | green |
Property tests: score is an integer 0–100; never decreases as time remaining increases; band changes only at the boundaries; remaining ≤ 0 means score 0.

### 6.2 Food Waste Risk Score
| Case | Expiry · Quantity · History · Storage | Result |
|------|---------------------------------------|--------|
| Low | 0.30 · 0.50 · 0.30 · 0 | 31 (Low) |
| High | 0.80 · 1.00 · 0.60 · 1 | 84 (High) |
| Boundaries | tuned vectors | 34 → Medium, 67 → High |
| History neutral | fewer than 5 closed items | uses 0.3 |

### 6.3 Other domain tests
- **Use This First:** a shuffled list of 20 items sorts by band severity, then least time, then highest risk; stable for ties; capped at six.
- **Action ladder:** each rule row has a test; raw meat/fish/egg never suggests Share/Donate; FSSAI-flagged items suggest "do not consume".
- **Date parsing:** "EXP 12/2026" → 31 Dec 2026 · "BEST BEFORE 05 MAR 2027" → 5 Mar 2027 · "Use by 15-08-25" → 15 Aug 2025 · "MFD 03/2026 Best before 6 months from MFG" → 30 Sep 2026 · letters mistaken for zeros are tolerated with medium confidence · manufacture date alone gives no expiry · garbage gives nothing · impossible dates (31/02) rejected · DD/MM/YYYY assumed.
- **FSSAI detector:** licence text with exactly 14 digits accepted; 13 or 15 digits and barcode digits rejected.
- **Nutrition:** BMI for 70 kg / 175 cm = 22.9 · BMR male 30 y, 70 kg, 175 cm = 1648.75; same female = 1482.75 · daily energy male at moderate activity = 2555.6 kcal · pregnancy/medical flag shows "consult a professional".
- **Units:** 1 kg = 1000 g; 1 l = 1000 ml; unknown unit is an error.
- **Listing window validator:** 1 h valid · 48 h valid · 48 h + 1 min invalid · negative invalid · beyond the category maximum invalid.
- **Approximate location:** result is 100–200 m from the original and never equal; the same listing always gets the same offset.
- **Reveal quota logic:** thresholds from settings (30/hour, 3/day per contact, new accounts 5/day).
- **Alias matching:** aloo→potato, begun→brinjal, "Palong Shak"→spinach, case- and accent-insensitive.
- **Ranking:** nearer wins when other terms are equal; a veg-only organisation never receives non-veg; ranking uses the public pin.

## 7. Database Tests (pgTAP)
### 7.1 Constraints, triggers, locks
| ID | Test |
|----|------|
| TC-LIST-001 | Inserting a listing with a window of 49 hours fails, even as the service role. |
| TC-LIST-002 | A category maximum above 48 hours cannot be saved. |
| TC-LIST-003 | Publishing with 0 photos fails; 1 to 4 pass; a fifth photo is refused. |
| TC-LIST-004 | Publishing without sender confirmation (or an outdated text version) fails. |
| TC-LIST-005 | **meat_fish_egg cannot be published, and no admin or direct update can set it to allowed.** |
| TC-LIST-006 | Cooked food prepared longer ago than its limit fails; within the limit passes. |
| TC-LIST-007 | An FSSAI-flagged item cannot be the source of a listing. |
| TC-LIST-008 | event_surplus without an event fails. |
| TC-LIST-009 | The 11th publish in 24 hours fails; a changed limit is respected; verified users get the higher limit. |
| TC-LIST-046 | A phone number or email address in the title, description or access notes is rejected or masked. |
| TC-ADD-001/002/003 | Cooked item needs cooking time; closed items need an outcome; base quantities are set correctly. |
| TC-NGO-001 | Documents over 5 MB or with other file types are rejected. |
| TC-NGO-002 | Status history cannot be updated or deleted. |
| TC-NGO-018 | In an approval request, the deciding admin cannot be the requesting admin. |
| TC-SEC-001 | The audit log cannot be updated or deleted by any role, including admin. |
| TC-IMPACT-001 | Writing the same impact source twice is ignored. |

### 7.2 Access rules (automated matrix)
A generated test runs every table × role (anonymous, member, other member, blocked member, verified organisation, admin without MFA, admin with MFA) × operation and compares with BACKEND SCHEMA §17. CI fails if a table lacks tests or the matrix and tests disagree.
Hand-written high-risk cases: TC-PRIV-001 anonymous users read none of the sensitive tables · TC-PRIV-002 a verified member cannot read contact points directly · TC-PRIV-003 user A cannot touch user B's inventory, nutrition, notifications, subscriptions · TC-PRIV-004 exact location of an approximate listing is hidden from everyone but owner/admin/approved requester · TC-PRIV-005 the requester cannot read the pickup code · TC-PRIV-006 setting account type to "ngo" grants nothing and nothing in the API can write `admin_users` · TC-PRIV-007 blocked users cannot see or request in either direction · **TC-SEC-023 anonymous callers cannot execute any RPC** · **TC-SEC-026 the Realtime publication contains only notifications, listings, listing_requests, emergency_requests.**

### 7.3 `reveal_contact()`
| ID | Scenario | Expected |
|----|----------|----------|
| TC-PRIV-010 | Visitor | denied |
| TC-PRIV-011 | Email not verified | denied |
| TC-PRIV-012 | Verified member, live listing, inside window | allowed; one audit row |
| TC-PRIV-013 | One second after the window, expiry job not yet run | denied |
| TC-PRIV-014 | "After approval" visibility, no request | denied |
| TC-PRIV-015 | "After approval", request approved | allowed until the pickup code expires |
| TC-PRIV-016 | Request pending or declined | denied |
| TC-PRIV-017 | Draft, cancelled or removed listing | denied |
| TC-PRIV-018 | Viewer blocked by owner | denied |
| TC-PRIV-019 | 31st reveal in an hour | denied |
| TC-PRIV-020 | 4th reveal of the same contact in a day | denied |
| TC-PRIV-021 | Event contact: verified organisation nearby with announcement allowed; normal member denied | as stated |
| TC-PRIV-022 | Every denial returns the identical generic result | identical |
| TC-PRIV-023 | Owner and admin (MFA) allowed; admin without MFA denied | as stated |
| TC-PRIV-024 | Account younger than 24 h: 6th reveal in a day denied | denied |
| TC-PRIV-038 | Feed distances and ranking use the public pin; exact location is never used before approval | as stated |

### 7.4 Jobs and lifecycle
TC-LIST-020 the expiry job flips only ended windows and is safe to run twice · TC-LIST-021 scheduled listings go live at their start · TC-TRACK-020 freshness job updates scores and creates one notification per band crossing; a second run creates none · TC-DATA-001 retention purge at +30 days clears contacts and exact locations, at +29 days it does not · TC-DATA-002 account deletion hides immediately and purges at +30 days · TC-RES-001 emergency/request expiry is idempotent · **TC-SEC-025 internal job routes reject missing or wrong secrets and accept only POST.**

## 8. Feature Suites
### 8.1 Accounts and profile
TC-AUTH-001 signup sends a verification email and lands on onboarding · 002 weak password rejected with guidance · 003 duplicate email gives a safe message · 004 unverified users can browse but cannot post, request, reveal or apply (UI and server) · 005 verification link works once; expired link offers resend · 006 resend has a 60 s cooldown · 007 login success; generic failure; 6th failure in 15 minutes limited · 008 stay-signed-in persists; logout clears; log out of all devices works · 009 forgot password: same response for unknown emails; link single-use and short-lived; other sessions revoked · 010 change password needs the current password and revokes other sessions · 011 change email needs confirmation on the new address · 012 Google sign-in links by verified email; Google-only account can set a password · 013 Turnstile failure blocks signup/contact · 014 account deletion needs re-authentication and hides listings immediately · 015 cookies are HTTP-only, Secure, SameSite · 016 auth callback rejects open redirects · **017 signup is impossible without confirming 18+ and accepting Terms/Privacy.** Profile: 001 phone never shown to others · 002 nutrition fields optional · 003 theme, language and Reduce-animations persist.

### 8.2 Add food, FSSAI
TC-ADD-010 camera capture, Retake, confirm · 011 camera denied shows the file fallback · 012 gallery upload accepts allowed types, compresses to ≈300 KB / 1280 px and **strips location data** · 013 barcode found pre-fills and caches · 014 barcode not found goes to manual with the code kept · 015 OCR shows per-field confidence, low-confidence fields highlighted and need confirmation · 016 saved values are the user's edits · 017 no expiry uses shelf-life defaults, overridable · 018 cooked food needs cooking time · 019 OCR/model failure shows a friendly message and manual entry · 020 models load only when Add Food opens. FSSAI: 001 packaged item with licence text and a 14-digit number is "present" · 002 packaged item with neither: user confirms "not visible", item flagged with warning and complaint guide, blocked from listing · 003 loose produce, cooked and home food skip the check · 004 wording never claims rejection or certification.

### 8.3 Tracking, alerts, Before You Buy
TC-TRACK-001 sort, filters and search work together · 002 status always colour + icon + text (greyscale screenshot) · 003 Use This First order and empty state · 004 closing an item with an outcome writes impact once · **005 raw meat/fish/egg can be tracked; Share/Donate/Swap actions are absent and the API refuses with CATEGORY_NOT_LISTABLE** · **006 a cooked non-veg dish can be listed** · 010 band crossing creates one in-app notification · 011 quiet hours defer push/email only · 012 push subscribe/unsubscribe; dead subscriptions removed · 013 notification copy renders localised placeholders. TC-BUY-001 scanning a product already at home shows quantity and expiry; unknown shows "not at home".

### 8.4 Recipes and nutrition
TC-RECIPE-001 ranking favours near-expiry items · 002 diet and allergies are hard filters (a peanut allergy never sees peanuts) · 003 alias matching · 004 recipe detail complete. TC-NUT-001 planner matches vectors, shows ranges and the notice · 002 suggestions use inventory and respect targets.

### 8.5 Listings, feed and map
TC-LIST-030 wizard requires a photo; 1–4 with preview, remove, reorder · 031 window picker never offers above the category maximum (never above 48 h) and shows the end time in IST · 032 consent sentence states exactly what is visible and until when; cannot publish without ticking · 033 location is a static pin; no continuous geolocation; "use my location" asks once · 034 event form requires an event and shows "feeds about N people" · 035 new listing appears for other users within 5 s · **036 default order is ending soonest, then nearest; Nearest, Newest, Most servings reorder correctly (12 seeded listings)** · 037 filters (distance, category, veg/non-veg, kind, time left, verified only) combine and are reflected in the URL · 038 countdown updates and pin colour changes near the end · 039 at window end the listing disappears without reload and contact/location are no longer retrievable · 040 extend (within limits) and end-early update viewers · 041 unclaimed expiry shows the fallback prompt · 042 list view mirrors the map for keyboard users · 043 meat/fish/egg never appears (direct insert attempt blocked) · 044 listing text is escaped · 045 swap propose/accept/decline · **047 map opens centred on Asansol and shows the West Bengal note outside the state.**

### 8.6 Maps and places
TC-MAP-001 pins show exact venues and approximate circles for homes · 002 clusters and selected-pin panel work with keyboard · 003 places layer shows verified organisations first and labels others "Not verified by Khabar Chakra" · 004 Bengali place names appear when the language is Bengali and a name exists · 005 address search goes through the server, is cached and rate-limited; the pin can always be dragged · 006 "Open in Maps" link carries the destination only · 007 attribution always visible · 008 tile or geocoder failure shows the list view and a friendly message.

### 8.7 Contact and location privacy (UI/API)
TC-PRIV-030 visitors never receive contact or location data (HTML, JSON, network) and Available Food requires login · 031 a verified member reveals the number with Call/WhatsApp buttons during the window · 032 after the window the button disappears and the API returns the generic result · 033 home donor: map pin is offset; exact address only for an approved requester · 034 scraping simulation: 40 reveals in an hour is limited and audited · 035 donor can choose "after approval" before publishing · 036 safety tips, Block and Report work · 037 Realtime never carries contacts or exact locations.

### 8.8 Requests and pickup code
TC-REQ-001 request notifies the donor; duplicates blocked · 002 approval creates the code visible only to the donor · 003 five wrong codes lock; the right code completes the pickup and writes impact for both once · 004 expired code fails · 005 several approvals while quantity remains; completed when exhausted · 006 decline notifies neutrally · 007 manual completion counts impact once.

### 8.9 Events
TC-EVENT-001 events up to 30 days ahead; 31 days fails · 002 verified organisation nearby sees the pre-announcement; normal member and pending organisation do not · 003 "We'll pick up" shows interested organisations to the host (names and badge only) · 004 surplus listing prefilled from the event in three taps or fewer · 005 cancelling notifies interested organisations.

### 8.10 Organisations and verification
TC-NGO-010 the required documents differ by kind (NGO, caterer, banquet hall, authority) and a missing one blocks submission; "one of" groups work · 011 uploads accept PDF/JPEG/PNG ≤ 5 MB; reject renamed executables, oversize and polyglot files (magic bytes) · 012 other users, other organisations and anonymous requests cannot get a document · 013 status flows follow the machine; illegal jumps rejected · 014 reasons are visible to the applicant with email and in-app notices · 015 unverified or suspended organisations get no broadcasts, requests or announcements · 016 suspension removes badge and access immediately · 017 applicants edit only in draft or needs-info · **018 deciding admin ≠ requesting admin.**

### 8.11 Verified badge
TC-BADGE-001 approved NGO/caterer/banquet/authority show the green leaf-tick on cards, profile and listing page; unverified and suspended do not · 002 hover shows the per-kind tooltip plus "Documents reviewed by Khabar Chakra." · 003 keyboard focus and tap show the same tooltip; Esc closes; screen readers read it · 004 shape differs from any other icon (not colour only); contrast passes in both themes · 005 reduced motion disables the shine · 006 visual snapshots of the three sizes in both themes · 007 Help text says the badge is not a food-safety guarantee.

### 8.12 Admin
| ID | Test |
|----|------|
| TC-ADMIN-001 | **`/admin` for visitors and normal users is redirected exactly like any unknown path (locale redirect) and then returns the identical standard 404.** |
| 002 | No admin route name, link or text appears in HTML or JavaScript served to non-admins. |
| 003 | The Admin menu item exists only for accounts in `admin_users`. |
| 004 | There is no separate admin login form. |
| 005 | Admin without an MFA session is asked for a code; wrong code fails; right code grants access. |
| 006 | Idle > 30 minutes signs out of admin; sensitive actions re-prompt. |
| 007 | All four admins work and the audit log shows the correct actor. |
| 008 | Case claiming: a second admin sees "being reviewed by another admin"; claims release after 30 minutes. |
| 009 | **Approve stays disabled until every required document is opened and marked reviewed; the API refuses too.** |
| 010 | Document links expire within 60 s; reuse fails; every open is audited without file contents. |
| 011 | Approve, reject and need-info update status, history, notifications and badge. |
| 012 | No API path can create admins. |
| 013 | Admin session start writes an audit row and triggers the alert email (mocked). |
| 014 | Reports queue works; three distinct reports pause a listing; admin can restore or remove. |
| 015 | Admins can edit FAQ/help and listing rules within limits; changes audited. |
| 016 | Contact inbox lists and updates messages; non-admins see none. |
| 017 | Repository contains no admin emails or route secrets (secret scan). |
| 018 | Admin is not in the sitemap or robots file; admin pages send noindex. |
| 019 | **Approving a trusted authority needs a second admin; the first approval alone does nothing.** |
| 020 | **An emergency suspension takes effect immediately and is reviewed by a second admin within 24 h; unreviewed suspensions raise a reminder.** |
| 021 | Revoking or restoring a badge needs a second admin. |

### 8.13 Waste, impact
TC-WASTE-001 every published waste type shows all five cards (audit fails otherwise) · 002 milk-packet steps in order · 003 drop points sorted by distance with unverified labels · 004 logging updates totals once; invalid weights rejected · 005 "may vary locally" note present. TC-IMPACT-010 ledger totals equal their sources · 011 CO₂e shows "approximately" and a source (placeholder visibly marked until set) · 012 public aggregates reveal no user data · 013 streak increments once per local day and resets after a missed day (clock set across IST midnight) · 014 leaderboard shows opted-in users only · 015 charts respect reduced motion and have text alternatives.

### 8.14 Help, FAQ, Contact, footer, Team
TC-HELP-001 **every published FAQ trigger opens (aria-expanded true, panel visible) and closes by click, Enter and Space** · 002 Tab order, visible focus, panel content reachable · 003 deep links open and scroll to the right item · 004 category chips filter; search narrows; empty result links to Contact · 005 FAQ text is in server-rendered HTML and has structured data · 006 all Help sections load with no broken links · 007 Markdown is sanitised. TC-SITE-001 contact form validates, uses Turnstile, saves to the admin inbox and sends no email to any team address · 002 limited to 3 messages per hour · **003 Technical support shows "Coming soon" while the setting says so; changing the setting updates the page without redeploy** · **004 footer ends with "Made by The S-QUAD" linking to the Team page** · **005 Team page shows the four names, titles and bios in plain text with no phone, email or social links** · 006 Terms, Privacy, Food-Safety Disclaimer, Community Guidelines exist and are linked from signup and listing consent · 007 SEO basics on public pages (private pages not indexed).

### 8.15 Internationalisation
TC-I18N-001 lint fails on hard-coded UI strings · 002 English complete; other languages fall back · 003 pseudo-locale (+40% length) has no clipping at 360 px · 004 `lang`, ₹ grouping and DD/MM/YYYY follow locale · 005 (Phase 6) Bengali and Devanagari fonts load only for those locales and render conjuncts correctly · 006 user text is never translated · 007 the cursive accent font switches per language (Caveat, Atma, Kalam).

### 8.16 PWA, resilience, flags
TC-PWA-001 manifest and icons valid, installable · 002 offline shows last-seen inventory read-only and write actions explain · 003 iOS non-installed shows the push fallback message. TC-RES-010 database unavailable shows a friendly page · 011 Open Food Facts or geocoder down falls back to manual · 012 email or rate-limit service limits degrade gracefully · 013 `/api/health` queries the database · 014 a switched-off feature is hidden and its API returns a consistent not-found.

## 9. Performance and Live Background
TC-PERF-001 Lighthouse budgets on landing, Available Food, Add Food, Dashboard · 002 bundle limits enforced · 003 the 3D chunk loads lazily and is absent elsewhere · 004 with reduced motion, "Reduce animations", low memory/CPU or data saver, the static background shows and **no WebGL context is created** · 005 a slow frame rate switches to the light background within 2 s and stays · 006 rendering pauses off-screen or in a hidden tab · 007 WebGL context loss falls back without crashing · 008 1,000 inventory items scroll without long tasks · 009 load test: 200 users, feed query p95 ≤ 1 s, reveal p95 ≤ 500 ms, errors ≤ 1% · 010 images in modern formats, CLS ≤ 0.1.

## 10. Accessibility
TC-A11Y-001 axe on all key pages in light and dark (including admin queue) · 002 keyboard-only journeys: sign up, add food manually, create a listing, request and enter a pickup code, FAQ, contact form · 003 dialogs trap and restore focus; skip link works · **004 a script reads the Market Fresh tokens and asserts contrast (text ≥ 4.5:1, UI/large ≥ 3:1) for every foreground/background pair in both themes, including chips, rings, focus ring and badge tick** · 005 status, badges, charts and map markers have text equivalents · 006 touch targets ≥ 44 px; usable at 200% zoom and 320 px · 007 camera flow operable without a mouse · 008 (manual) NVDA, VoiceOver and TalkBack passes.

## 11. Security Tests (rules in SECURITY.md)
TC-SEC-010 ID sweep over every route with an ID returns 403/404 for other users' data · 011 injection payloads in search, filters, bbox, slugs cause no leaks or changes · 012 script payloads in listing text, messages, display names, Markdown render inert · 013 cross-origin mutating requests are rejected · **014 security headers and the Content-Security-Policy are present on key pages** · 015 tampered or expired tokens give 401; anonymous key cannot call privileged RPCs · 016 upload abuse (wrong type, double extension, oversize, empty, SVG with script, polyglot) rejected · 017 secrets absent from client bundles and public files · 018 rate limits return 429 with Retry-After · 019 no account/listing enumeration through errors · 020 audit and secret scans on every push; ZAP nightly · 021 schema probing as anonymous returns nothing · 022 logs contain no phone, email, address, token or code. Manual at release: second-person review of access rules, threat-model walkthrough of reveal, documents and admin, encrypted-backup check, production variables set only in the hosting dashboards.

## 12. Manual, Device, AI Quality, Release
**Devices:** low-end Android (2–3 GB), mid-range Android (Chrome and Samsung Internet), iPhone Safari (browser and installed), desktop Chrome/Edge/Firefox/Safari, tablet.
**AI/OCR evaluation:** a team-collected set (≥ 50 loose-food photos, ≥ 80 packaged labels in English/Bengali/Hindi, varied light and angles). Report: barcode decode rate (expect ≥ 90% on clear shots) · date accuracy on clear labels (target ≥ 70%) · **wrong date with high confidence must be < 5%** · FSSAI-number precision (false "present" ≤ 2%) · top-3 classification accuracy · high-confidence bucket ≥ 90% correct · median time on a low-end phone ≤ 8 s or show progress with a manual skip. CI fails only on regressions of the false-positive and calibration targets.
**Usability:** 5 sessions (including a non-technical adult and a student): add a food item, read the colours, list food for 3 hours, find Help, request food and enter a pickup code; fix any task under 80% success.
**Pilot:** 2–3 Asansol organisations and one caterer or banquet hall before public launch: dry-run an event pre-announcement and a small real pickup with the code.
**Content review:** shelf-life numbers, waste-guide steps, legal text and FAQ answers reviewed by a second teammate with sources recorded.
**Release checklist:** all gates green on the release commit · nightly full suite, ZAP and load test within 24 h · device matrix, screen-reader pass and AI evaluation recorded · PRD §13 criteria mapped to test IDs · production smoke script ready (health, signup page, FAQ opens, Available Food requires login, `/admin` returns the standard 404) · backups and keep-alive verified; rollback tested; restore drill done · four admins created, MFA on two devices each, sign-in alert verified, two-admin rule exercised in staging · placeholders removed or clearly labelled (CO₂e source, prices, "Coming soon") · privacy/grievance channel live · legal texts reviewed.

## 13. CI Mapping
| Trigger | Jobs | Budget |
|---------|------|--------|
| Pull request | install → lint + typecheck → unit/component (sharded) → database tests → API tests → build → size limits → Playwright smoke (Chromium + one mobile) → axe → Lighthouse → secret scan + audit → Vercel preview | ≤ 10 min |
| Merge to main | above + migrations on staging → full E2E on staging | ≤ 20 min |
| Nightly | full browser matrix, visual regression, ZAP baseline, traceability report, AI evaluation (if models changed) | ≤ 60 min |
| Weekly | load test on staging, restore drill | on demand |
| Release | everything + manual checklist | — |
Flaky policy: a test that passes only on retry is tagged flaky, reported, and fixed or quarantined within 48 hours; quarantined tests cannot be the only coverage of a Must requirement. Artifacts: traces, videos, coverage, Lighthouse and ZAP reports, traceability list.

## 14. Defects
| Severity | Meaning | Response |
|----------|---------|----------|
| S1 Critical | Data exposure, privacy or safety-rule bypass, admin compromise, site down | Stop release; fix now; add regression test |
| S2 High | Core flow broken, no workaround | Fix before release |
| S3 Medium | Impaired with workaround | Fix this or next phase |
| S4 Low | Cosmetic | Backlog |
Closing an S1/S2 bug requires its regression test in the same pull request.

## 15. Test Organisation
Folders: unit, component, api, e2e (by area), fixtures (photos, documents, AI evaluation set), factories, helpers; database tests live with the migrations. Each test file mirrors the code it covers. Snapshot tests only for stable visual components. Playwright flows use small page-object helpers and the standard accounts in §3.

## 16. Traceability Snapshot
FR-AUTH/PROF → TC-AUTH, PROF, SEC · FR-ADD/FSSAI → TC-ADD, FSSAI, AI evaluation · FR-TRACK/BUY → TC-TRACK, BUY, §6 · FR-RECIPE/NUT → TC-RECIPE, NUT · FR-SHARE → TC-LIST, PRIV, REQ, EVENT, MAP · FR-NGO/ADMIN → TC-NGO, BADGE, ADMIN · FR-EMERG → emergency suite (NGO-only) plus TC-NGO-015 · FR-WASTE/IMPACT → TC-WASTE, IMPACT · FR-SITE → TC-HELP, SITE, PWA, I18N · NFR → TC-PERF, A11Y, SEC, RES.

## 17. Confirmed Assumptions
Emergency mode is for verified NGOs only · default feed order is ending soonest then nearest · meat/fish/egg listing is locked off · four admins with the two-admin rule · jobs run as internal routes and time-critical rules in SQL, with `p_now`/`app_now()` for testability · Mailpit/Inbucket captures emails in tests.

---
*End of TESTING v1.1.*