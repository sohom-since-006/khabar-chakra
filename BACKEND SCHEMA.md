# BACKEND SCHEMA — Khabar Chakra (খাবার চক্র)

> **Version 1.1** · Status: **Final draft, usable directly** · Supersedes v1.0.
> Depends on PRD v1.1, TRD v1.1. Feeds ARCHITECTURE · SECURITY · TESTING. Binding decisions: AGENTS.md §2.
> **Platform:** Supabase (PostgreSQL, PostGIS, Auth, Storage, Realtime, pg_cron, pg_net), region Mumbai, free tier.
> **How to read:** the tables, constraints, rules and policies here are normative. SQL migrations are generated from this document in Phase 1. Column lists use "type · rule" form.

## 0. What changed since v1.0
New: `app_now()` time helper · `org_kind` and per-kind required documents · case claiming and "document opened" tracking · `admin_action_approvals` (two-admin rule) · profile suspension and 18+ confirmation fields · `privacy_request` contact topic · place Bengali names and district · notification delivery columns · reveal-quota settings · free-text hygiene rule · locked meat/fish/egg rule · Realtime publication list · function-grant rule · jobs now call internal web-app routes.

## 1. Conventions
Naming `snake_case`, plural tables · keys `uuid` default random, except lookup tables · timestamps `timestamptz` UTC with `created_at`/`updated_at` (trigger) · soft delete only where history matters · geography `Point` in WGS84 (distances in metres) · quantities as `numeric` + unit enum + normalised base value · i18n content as JSON maps with an English entry required · money in ₹ · no PII in logs/audit metadata · **RLS enabled on every `public` table; no policy = no access** · service role only on the server · migrations forward-only · generated types committed.

## 2. Extensions and Helpers
Extensions: PostGIS, pg_trgm, unaccent, pg_cron, pg_net.
Helper functions (security definer, fixed `search_path`):
- `app_now()` — returns the current time, overridable in tests (all time-dependent policies/functions use it).
- `is_admin()` — user in `admin_users` **and** an MFA (AAL2) session.
- `is_email_verified()` — email confirmed.
- `is_verified_org_owner()` — owns an `approved`, non-suspended organisation.
- `not_blocked(owner)` — no block in either direction.
**Function grants rule:** every RPC has `EXECUTE` revoked from `PUBLIC` and `anon`, then granted to `authenticated` only (functions are callable by `anon` by default otherwise).

## 3. Enumerations
- account_type: member, business, ngo · (admin is **not** an account type)
- diet_pref: veg, non_veg, eggetarian, vegan, jain, no_preference · diet_type (label): veg, non_veg, egg, vegan
- activity_level, sex_at_birth, storage_method (room, fridge, freezer), qty_unit (g, kg, ml, l, pc, pack, plate, serving, bowl)
- food_category: packaged, vegetables, fruits, meat_fish_egg, dairy, grains_pulses, bread_bakery, cooked_food, beverages, other
- packaging_type, fssai_status (present, not_visible, not_applicable, unknown), expiry_source, fresh_band (green, amber, red, expired), item_status, item_outcome (consumed, shared, donated, composted, recycled, discarded)
- listing_kind: donate, share, swap, event_surplus · listing_status: draft, scheduled, open, reserved, completed, expired, cancelled, removed
- location_visibility: exact, approximate · contact_visibility: logged_in_during_window, after_approval
- request_status: pending, approved, declined, cancelled, expired, completed · completion_method: pickup_code, manual
- event_type: wedding, reception, birthday, corporate, religious, festival, community, other · event_status
- **org_kind: ngo, caterer, banquet_hall, authority** · org_type (for NGOs): orphanage, shelter, community_kitchen, hostel, old_age_home, community_centre, ngo_other
- verification_status: draft, submitted, under_review, needs_info, approved, rejected, suspended
- org_doc_type: registration_certificate, tax_exemption_12a_80g, ngo_darpan, pan, address_proof, authorised_person_id, premises_photo, fssai_licence, business_registration, official_letter_or_id, designation_letter, official_email_proof, other · doc_status: pending, accepted, rejected
- approval_action: approve_authority, revoke_badge, restore_badge, review_emergency_suspension · approval_status: pending, approved, rejected, expired
- place_type, place_source (osm, curated, partner), emergency_status, offer_status, waste_outcome
- notification_kind, **contact_topic: food_info, donation, tech_support, partnership, food_distribution, privacy_request, other**, inbox_status, report_target, report_status

## 4. Entity Groups
Identity (profiles, admin_users, nutrition_profiles, preferences, push, blocks) · Inventory (food_items, shelf_life_defaults, products_cache) · Content (recipes, ingredients, aliases, nutrition_foods, waste_types, FAQ, help, settings) · Organisations (organizations, documents, history, required-documents, approvals, places) · Sharing (events, listings, photos, private location, contact points, requests, pickup codes, swaps, reveals) · Emergency · Impact (ledger, constants, prices, badges, streaks) · Notifications, moderation, audit.

## 5. Identity, Profile, Settings
### 5.1 `profiles` (1:1 with Supabase `auth.users`)
id (PK, FK to auth user, cascade) · display_name (2–60) · avatar_path · phone (optional, validated, never public) · account_type (default member; **grants no privileges**) · city · area_label · home_location (optional, coarsened ≈200 m) · household_size (1–50) · locale (en/bn/hi) · timezone (default Asia/Kolkata) · theme (system/light/dark) · reduce_motion · onboarding_completed · **adult_confirmed_at** (time the user confirmed 18+; no birth date stored) · **suspended_at, suspension_reason** · **leaderboard_opt_in** (default false) · deleted_at · created_at/updated_at.
Created by a trigger on signup together with preferences and streak rows.

### 5.2 `admin_users`
user_id (PK, FK profiles) · granted_at · granted_by. Rows are inserted **only by a database owner** (never by the API). Four admins.

### 5.3 `nutrition_profiles` (sensitive, separate)
user_id (PK) · birth_year · sex · height_cm · weight_kg · activity · diet · allergies (list) · goal (maintain/lose/gain) · updated_at.

### 5.4 Others
`notification_preferences` (in_app, push, email_digest, lead_time_hours 1–168, quiet_start/end, emergency_alerts, alert_radius_km 1–50) · `push_subscriptions` (endpoint unique, keys, user agent, last success; deleted on `410`) · `blocks` (blocker, blocked; composite key; not equal).

## 6. Inventory and Reference Data
### 6.1 `food_items`
id · owner_id (cascade) · name (1–100) · category · diet_type · qty_value/qty_unit · qty_base/qty_base_unit (set by trigger) · purchase_date · cooked_at · expiry_date · expiry_source · storage (default room) · packaging · barcode · fssai_status · fssai_license_no (14 digits) · is_flagged · photo_path/thumb_path (private bucket) · notes (≤ 500) · **deadline_at, freshness_score (0–100), band, risk_score (0–100), last_scored_at** (server-computed by the shared domain module) · ai_meta (per-field confidence only) · status (active/closed) · outcome · closed_at.
Rules: closed ⇔ outcome present; cooked_food requires cooked_at.
Indexes: (owner, status, deadline) · (owner, band) active · name trigram · (owner, barcode).

### 6.2 `shelf_life_defaults`
Key (category, storage) · default_shelf_hours · amber_h · red_h · risk_weight · weekly_need_g · **source_note (required)** · updated_by/at. Admin-editable.

### 6.3 `listing_rules` (the 48-hour ceiling)
category (PK) · allowed · default_window_hours · **max_window_hours (database check: 1 to 48)** · max_hours_since_prepared · requires_prepared_at · safety_notice_key · updated_by/at.
Initial values (editable except where locked): cooked food default 3 h / max 6 h / prepared within 4 h; dairy default 2 h / max 12 h; vegetables and fruits default 24 h / max 48 h; packaged, grains/pulses, beverages default 24 h / max 48 h; bread/bakery default 12 h / max 24 h.
**`meat_fish_egg`: `allowed = false`, locked by a database check so no admin or API can enable it in v1.**
The ceiling is enforced twice: here and by the listing window check (§8.1).

### 6.4 Others
`products_cache` (barcode PK, name, brand, category, quantity text, diet label, image URL, ingredients, source, raw, fetched_at) · `shopping_list_items` (user, name, barcode, quantity text, checked).

## 7. Recipes, Ingredients, Nutrition
`ingredients` (slug, name_i18n, category, link to nutrition food, allergen group) · `ingredient_aliases` (alias, locale → ingredient; accent-insensitive; e.g. aloo→potato, begun→brinjal) · `nutrition_foods` (name, source USDA_FDC/IFCT/manual, source_ref, licence, per-100 g values, fetched_at) · `recipes` (slug, title/description/steps i18n, prep/cook minutes, servings, diet_type, region, image, per-serving nutrition, allergens, source, licence, is_published) · `recipe_ingredients` (recipe, ingredient, quantity, unit, optional, note_i18n) · `saved_recipes`.

## 8. Sharing, Events, Pickup
### 8.1 `listings`
id · owner_id · kind · event_id (required for event_surplus) · source_item_id (optional; flagged items refused) · status (default draft) · title (3–80) · description (≤ 1000) · category · diet_type (donor must choose) · qty_value/qty_unit · serves_people (1–100000) · prepared_at · storage_note (≤ 300) · container_available · **map_location** (what every viewer sees: exact for venues, offset ≈100–200 m for homes) · **area_label** (always safe to show) · location_visibility · contact_visibility · available_from · **available_until** · sender_confirmed_at · confirmation_version · published_at · closed_at · close_reason · completion · created_at/updated_at.
Database rules: available_until after available_from and **at most 48 hours** later; event_surplus requires an event; **title, description and access notes reject/mask phone numbers and email addresses** (trigger).
**Publishing** happens only through `rpc_publish_listing`, which requires: 1–4 photos; sender confirmation with the current text version; allowed category (never the locked one); window within the category maximum; cooked food prepared recently enough; source item not flagged or expired; a pickup contact; ≤ daily publish limit; verified email; not suspended.
Indexes: spatial on map_location · (status, available_until) for live statuses · (owner, status) · (event) · (kind, status).

### 8.2 `listing_photos`
listing (cascade) · path · thumb_path · position 1–4 (unique per listing). Photos are re-encoded on the device (no location data), ≤ 300 KB.

### 8.3 `listing_private`
listing_id (PK) · exact_location · address_text · venue_name · access_notes.
Readable by: owner; admin; approved requester; or any logged-in, email-verified user while the listing is live **if** `location_visibility = exact`. For `approximate` listings, only after approval.

### 8.4 `contact_points`
id · owner · exactly one of listing / event / emergency request · contact_name · phone · whatsapp · email (optional) · created_at.
**No direct SELECT for anyone except owner and admin.** Everyone else gets contacts only through `reveal_contact()`.

### 8.5 `listing_requests`
id · listing (cascade) · requester · org_id (optional) · message (≤ 300) · qty_wanted · eta_minutes · status · decided_at/completed_at · unique (listing, requester). More than one approval is allowed while quantity remains.

### 8.6 `pickup_codes`
request_id (PK) · code (6 digits, random) · expires_at (window end + 1 h) · attempts (locks after 5) · verified_at.
Created on approval. The donor can read the code; the recipient never can. `rpc_complete_pickup` verifies it, completes the request and writes impact for both parties.

### 8.7 Swaps
`listing_swap_wants` (listing PK, wanted_text ≤ 200, wanted_category) · `swap_proposals` (listing, proposer, offered listing or text, status).

### 8.8 `events`
id · host_id · title · event_type · venue_name · address_text · location (static pin) · starts_at · serving_ends_at · expected_surplus_from · expected_servings · diet_notes · announce_to_ngos (default true) · status · timestamps. Announced up to 30 days ahead.
Visible to: owner, admin, and verified organisations nearby when announced. Other users see only the live event listings.
`event_interests` (event, org; composite key).

### 8.9 Contact reveal and audit
`contact_reveals` (contact_point, viewer, revealed_at, salted ip_hash). `reveal_contact()` checks, in order: logged in → email verified → not suspended → subject live and inside its window (read through `app_now()`) → visibility rule (or approved request) → not blocked → quotas from `site_settings.reveal_quotas` (30/hour, 3/day per contact, new accounts 5/day, Turnstile hint after 10/hour) → writes the reveal row → returns the contact. **Every denial returns the same generic result.** Approved requesters can still reveal until the pickup code expires. Verified organisations can reveal event contacts when the event is announced.

### 8.10 Expiry
A job runs every minute and marks live listings whose window has ended as expired. **Visibility is already enforced at read time**, so access ends exactly on time even before the job runs. Donors can extend (within limits) or end early.

## 9. Organisations and Verification
### 9.1 `organizations`
id · owner_id (unique; one per account in v1) · **kind (org_kind)** · name · org_type (NGOs) · registration_no · darpan_id · description (≤ 600) · address_text · location (static pin) · service_radius_km · veg_only · halal_only · capacity_servings · accepting · hours · contact_person · contact_phone/contact_email (admin-visible; shown to donors only after an approved request) · status · status_reason (visible to the applicant) · verified_at · verified_by · last_reviewed_at · **claimed_by, claimed_at** (case claim, auto-release after 30 minutes) · timestamps.
PAN and ID numbers are **not stored as text**; they exist only inside private documents.

### 9.2 `org_required_documents`
kind · doc_type · required · group_key (for "any one of" sets, e.g. 12A/80G **or** NGO Darpan). Seed per kind: NGO — registration certificate; 12A/80G or Darpan (one of); PAN; address proof; authorised-person ID; premises photo. Caterer and banquet hall — valid FSSAI licence; business registration or trade licence; address proof; owner/authorised-person ID; premises photo. Authority — official letter or ID card; designation letter; official-email proof (optional).

### 9.3 `organization_documents`
id · org (cascade) · doc_type · storage_path · mime_type (pdf/jpeg/png) · size_bytes (≤ 5 MB) · status · reviewer_note · **first_opened_at** · reviewed_by/reviewed_at · uploaded_at.
**Approval is refused unless every required document (and one of each "any one of" group) is present and has `reviewed_at`.**

### 9.4 History and approvals
`organization_status_history` (append-only). **`admin_action_approvals`**: id · action (approve_authority, revoke_badge, restore_badge, review_emergency_suspension) · org_id · requested_by · requested_at · decided_by · decided_at · status · reason · expires_at (72 h; 24 h for emergency review). Database check: `decided_by` differs from `requested_by`. **Two-admin rule:** approving a trusted authority and permanently revoking/restoring a badge complete only after a second admin approves. One admin may suspend immediately; a second admin reviews within 24 h.

### 9.5 Status machine
draft → submitted → under_review → approved / rejected / needs_info (→ submitted) · approved ⇄ suspended. Changes only through RPCs; the owner can edit only in draft or needs_info.

### 9.6 `places`
id · name · **name_i18n** (Bengali from OSM when present) · place_type · location · address_text · phone (public business phone only) · opening_hours · **district, state** · source · osm_id (unique) · org_id (partner link) · verified_by_platform · tags (accepted waste types) · is_active · last_synced_at. UI label for non-partners: "Not verified by Khabar Chakra".

## 10. Emergency Food Sharing (verified NGOs)
`emergency_requests` (requester, org, title, need_description, servings_needed, diet requirement, needed_by ≤ 72 h ahead, location, area_label, status, timestamps; verified NGO requests start open, others pending review) · `emergency_offers` (request, offerer, listing/item, message, status). Contacts follow the normal reveal rules. A job expires requests at the deadline.

## 11. Waste Guidance and Logging
`waste_types` (slug PK, group_key, name_i18n, icon, what_is_i18n, reuse/recycle/compost/dispose cards with possible flag, text and steps, drop-point place types, local_note_i18n, sort_order, is_published) · `waste_logs` (user, waste type, weight_kg 0.01–100, outcome, item, place, logged_at).

## 12. Impact, Badges, Streaks
`impact_events` (append-only ledger: user, source_type, source_id, kg_food_rescued, rupees_saved, co2e_kg, composted/recycled kg, servings_fed, points; unique per user and source so jobs never double count) · `impact_constants` (key, value, unit, **source_citation**, note) · `category_prices` · `badges` · `user_badges` · `user_streaks`. A public function returns **only aggregates**. Leaderboard shows opted-in users only. Points have no cash value.

## 13. Notifications
`notifications`: user · kind · title_key/body_key + params · deep-link ids · **dedupe_key** (unique per user) · read_at · **push_sent_at, email_sent_at, attempts** · created_at. Realtime enabled with row-level filtering.

## 14. Help, FAQ, Contact, Site Content
`faq_categories`, `faq_items` (slug for deep links, question/answer i18n in sanitised Markdown, audience, sort, published), `help_articles` (section, title/body i18n) · `contact_messages` (**admin inbox**: optional user, name, reply email, topic, subject, message, status, internal note, handler, salted ip_hash; inserted only by the contact route; no public read) · `site_settings` (key → JSON): `public_contact` (tech support status "coming_soon", form enabled), `legal_versions`, `maintenance_mode`, **`reveal_quotas`** · `feature_flags` (key, enabled, rollout %): ai_scan, three_d_background, emergency_mode, event_mode, swap, push_notifications, vision_fallback. Static pages (Terms, Privacy, Team) live in the codebase.

## 15. Moderation and Audit
`reports` (reporter, target type/id, reason, details ≤ 500, status, handler; three distinct reports pause a listing) · `audit_log` (append-only: actor, role, action, entity, metadata without PII, salted ip_hash, created_at; admins can read; **no update/delete policy exists**). Typical actions: org.approve, org.suspend, document.open, listing.remove, contact.reveal_denied, admin.session_start, approval.requested/decided.

## 16. Storage Buckets
| Bucket | Access | Path | Limits |
|--------|--------|------|--------|
| avatars | public read | user/uuid | ≤ 200 KB WebP |
| food-photos | **private** | user/item/uuid | ≤ 400 KB |
| listing-photos | public read (unguessable paths; URLs only given to logged-in users) | owner/listing/uuid | ≤ 300 KB, max 4, no location data |
| ngo-docs | **private** | org/uuid | ≤ 5 MB, pdf/jpeg/png; owner and admins via ≤ 60 s signed links |
| recipe-images, content-images | public read | — | admin write |
Storage policies mirror the table rules. Thumbnails are made on the device.

## 17. Access Matrix (Row Level Security)
O owner · A admin (MFA) · V logged-in, email-verified · VO verified organisation owner · S server only · — none.
| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | O, A (public fields via a view) | trigger | O (limited), A | via deletion RPC |
| admin_users | A | S (migration only) | — | — |
| nutrition_profiles, preferences, push, notifications | O | O/S | O | O |
| blocks | O | O | — | O |
| food_items | O | O | O | O |
| reference/content tables (published) | V or public where published | A | A | A |
| products_cache | V | S | S | — |
| listings | V (live, not blocked), O, A | O (draft) | O (limited; status via RPC) | O (draft) |
| listing_photos | as parent | O | O | O |
| listing_private | O, A, approved requester, V if live and exact | O | O | cascade |
| contact_points | **O, A only** | O | O | O |
| contact_reveals | A | S | — | — |
| listing_requests | requester, listing owner, A | V (not blocked) | requester (cancel); owner via RPC | — |
| pickup_codes | donor, A | S | S | — |
| events | O, A, VO if announced and nearby | V (verified business/host) | O | O |
| organizations | O, A; approved via public view (no contacts) | V | O (draft/needs_info) | deletion |
| organization_documents | O, A | O (draft/needs_info) | A (review fields) | O (draft/needs_info) |
| org_required_documents | V | A | A | A |
| admin_action_approvals | A | A | A (second admin) | — |
| places | V | A/S | A | A |
| emergency_requests/offers | V (open), O, A | V | O, A | O |
| waste_logs | O | O | O | O |
| impact_events | O | S | — | — |
| contact_messages | A | S | A | A |
| reports | A; reporter own status | V | A | — |
| audit_log | A | S | — | — |
| site_settings, feature_flags | public view of safe keys; A write | A | A | A |
Every policy has an allow test and a deny test. **Realtime publication contains only:** notifications, listings, listing_requests, emergency_requests.

## 18. Key Functions (RPCs)
| Function | Purpose | Caller |
|----------|---------|--------|
| signup trigger | Create profile, preferences, streak | trigger |
| `rpc_publish_listing` | Enforce §8.1 rules; open or schedule | owner |
| `rpc_extend_listing` / `rpc_cancel_listing` | Extend within limits / end early | owner |
| `reveal_contact` | §8.9 | V |
| `rpc_request_listing` / `rpc_decide_request` | Request / approve (creates pickup code) or decline | V / owner |
| `rpc_complete_pickup` | Verify code, complete, write impact | requester |
| `rpc_match_partners` | Ranked verified organisations (public pin until approval) | owner/server |
| `rpc_listings_in_view` | Map/feed query, live only, ≤ 100 rows | V |
| `rpc_nearby_places` | Organisations and drop points | V |
| `rpc_admin_claim_case` / `rpc_admin_release_case` | Case claiming | A |
| `rpc_admin_open_document` | Logs the open, sets first_opened_at, returns a ≤ 60 s link | A |
| `rpc_admin_mark_reviewed` | Marks a document reviewed | A |
| `rpc_admin_decide_org` | Moves status; refuses if documents unreviewed; creates an approval request when the two-admin rule applies | A |
| `rpc_admin_decide_approval` | Second admin approves or rejects | A (not the requester) |
| `rpc_close_item` | Close inventory item; write impact | O |
| `fn_public_impact` | Landing aggregates only | public |
| `rpc_delete_account` | Mark deleted, revoke sessions, hide listings | O |

## 19. Scheduled Jobs
| Job | Schedule | Runs |
|-----|----------|------|
| expire listings, go-live scheduled, expire requests and emergency requests, "15 minutes left" warnings, retention purge | every 1–10 minutes / daily | **SQL only** |
| recompute freshness and alerts | hourly | pg_cron → pg_net → `/api/internal/jobs/freshness` |
| dispatch push and email | every 5 minutes | pg_cron → pg_net → `/api/internal/jobs/dispatch` |
| keep-alive | daily | GitHub Actions → `/api/health` |
| backup | weekly | separate private repo / private storage |
Every job function takes `p_now` (defaults to `app_now()`) so tests can control time. URL and secret live in Supabase Vault.

## 20. Retention and Deletion
| Data | Retention |
|------|-----------|
| Phone/email in contact points of closed listings | removed at +30 days |
| Exact location of closed listings | deleted at +30 days |
| Listing photos | deleted 90 days after close (sooner on request) |
| Contact reveals | 90 days |
| Contact messages | 12 months (spam 30 days) |
| Notifications | read 60 days; unread 180 days |
| Organisation documents | while active; deleted within 30 days of rejection or account deletion |
| Audit log | 24 months |
| Impact events | kept, anonymised when an account is deleted |
| Deleted accounts | hidden immediately; hard-deleted after 30 days |

## 21. Seed Data
shelf_life_defaults (sources filled) · listing_rules (§6.3) · ingredients + aliases (~300) · nutrition_foods subset · ≥ 100 Indian/Bengali recipes · waste_types (milk packet, plastic bottle, container, wrapper, paper, cardboard, metal can, glass bottle, veg peels, fruit peels, tea leaves, eggshell, cooking oil, cooked leftovers, thermocol, tissue, other) · places (curated Asansol + per-district imports) · FAQ/help starter set · badges · org_required_documents · impact_constants and category_prices (clearly marked placeholders) · site_settings, feature_flags · admin_users (added by SQL by a database owner) · demo data in a separate local-only seed.

## 22. FAQ and Help Outline
Categories: Getting started · Account and password · Tracking food · Donating and sharing · Events (weddings, parties) · For organisations (NGOs, caterers, banquet halls, authorities) · Food safety · Waste and recycling · Privacy and safety · Technical support (*Coming soon*). Help sections: Getting started, Donors, Event hosts and caterers, Organisations, Food safety, Waste guide, Troubleshooting.

## 23. Authentication Data Flow
Sign-up creates the Auth user, then profile rows by trigger, and a verification email. Until verified, posting, requesting, revealing and applying are refused (UI and database). Sessions use HTTP-only cookies with refresh rotation. Password reset and change revoke other sessions. Email change needs confirmation on the new address. Admins need an `admin_users` row plus an MFA session. Organisation powers come only from an `approved` organisation. Users confirm 18+ at signup (`adult_confirmed_at`).

## 24. Migration Plan
0001 extensions and enums · 0002 core identity and helpers (including `app_now()`) · 0003 food inventory and rules · 0004 content (recipes, waste, help, settings) · 0005 organisations, required documents, approvals, places · 0006 events and listings (photos, private, contacts, requests, codes, swaps, reveals) · 0007 emergency · 0008 impact · 0009 notifications, moderation, audit, contact inbox · 0010 policies and storage rules · 0011 functions, grants and jobs · 0012 reference seed. Each migration ships with updated types and database tests.

## 25. Open Schema Questions
SQ-1 CO₂e coefficient and citation · SQ-2 final shelf-life values and sources · SQ-3 confirm 6-digit pickup code format · SQ-4 whether verified organisations may see one another on the map (default: no) · SQ-5 exact quota numbers after real-world testing.

---
*End of BACKEND SCHEMA v1.1.*
