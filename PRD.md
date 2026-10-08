# PRD — Khabar Chakra (খাবার চক্র)

> **Product Requirements Document** · **Version 1.1** · Status: **Final draft, usable directly**
> Supersedes v1.0. Binding decisions: AGENTS.md §2 (D1–D24). Companion docs: TRD · BACKEND SCHEMA · ARCHITECTURE · DESIGN SYSTEM · SECURITY · TESTING · CODE_STYLE · AGENTS · README.
> **Tagline:** Save • Share • Sustain · **Team:** The S-QUAD, Asansol Engineering College

## 0. What changed since v1.0
Static map pins · time-boxed sharing (donor-chosen window, hard ceiling 48 h) · required photos · contact visible to logged-in, email-verified users during the window · event mode with pre-announcement and pickup code · raw meat/fish/egg track-only · four organisation kinds with admin-verified green leaf-tick · four admins, hidden admin entry, two-admin rule · Help Centre, working FAQ, contact inbox, Team page, "Made by The S-QUAD" footer · 18+ only · West Bengal map focus · new palette "Market Fresh" and Hindi removed from the logo · English first.

---

## 1. Overview
### 1.1 What it is
Khabar Chakra (*Khabar* = food, *Chakra* = cycle) is a free, web-first platform that manages the **life cycle of food**: prevent waste by tracking freshness, **share surplus** (from homes, weddings and other events) with nearby people and verified organisations for a limited time, and route unavoidable waste to reuse, recycling, composting or responsible disposal.

`Buy → Track → Store → Consume → Cook → Share → Donate → Reuse → Recycle → Dispose responsibly`

### 1.2 Problems
1. Households, hostels, canteens and restaurants lose track of purchase dates, expiry dates and freshness, so edible food is thrown away.
2. Weddings, parties and functions end with large leftovers and no quick, trusted local channel to pass them on.
3. People do not know how to handle leftover packaging and unavoidable food waste correctly.

### 1.3 Vision
No edible food dies from neglect, and no waste ends up in the wrong place.

### 1.4 Product principles
| # | Principle | Meaning |
|---|-----------|---------|
| P1 | **Zero-cost** | Free tiers and open source only. |
| P2 | **Never certify safety** | The platform helps people decide; the recipient always decides. A verified badge means documents were reviewed, not that food is safe. |
| P3 | **No dead ends** | Every item has a next best action. |
| P4 | **Confirm, don't trust** | AI/OCR suggestions always appear on an editable confirmation screen. |
| P5 | **Concrete benefits, no guilt** | "Use this today, save about ₹40", never "you're wasting food". |
| P6 | **Time-boxed and private by default** | Contacts and locations are visible only to the right people, only for the chosen window. |
| P7 | **Delight without clutter** | Live visuals never hurt readability, speed or accessibility. |

---

## 2. Goals, Non-Goals, Metrics
### 2.1 Goals (v1.0 release)
G1 Add food by photo/barcode/manual and see live freshness · G2 Timely alerts · G3 Recipes (Indian/Bengali focus) and nutrition from what is at home · G4 Share, donate and swap food for a chosen window, with a map, photos and pickup code · G5 Event mode for weddings and functions · G6 Organisation sign-up (NGO, caterer, banquet hall, trusted authority) with admin document verification and a verified badge · G7 Waste guide and impact dashboard · G8 Polished, accessible, animated UI in Light and Dark mode · G9 Help Centre, FAQ and contact · G10 Deployable at ₹0 recurring cost.

### 2.2 Non-goals (v1.0)
Native apps (the site is an installable PWA) · payments or delivery logistics · certifying food safety · real-money or crypto tokens · SMS/OTP login · live GPS tracking · in-app chat between users · Bengali/Hindi UI at launch (built-in readiness only) · service for people under 18.

### 2.3 Success metrics (first 3 months, indicative)
| Metric | Definition | Target |
|--------|-----------|--------|
| Activation | New users who add ≥ 1 item in 24 h | ≥ 50% |
| Food rescued (kg) | Σ items closed as eaten/shared/donated + pickups completed | Tracked, formula shown |
| Donation completion | Listings reaching "completed" ÷ published | ≥ 40% |
| Event adoption | Events pre-announced and listings completed from them | Tracked |
| NGO verification time | Median application → decision | ≤ 3 days |
| Performance | Lighthouse mobile Performance / Accessibility | ≥ 80 / ≥ 90 |
Public statistics (for example "₹89,000 Cr+") need a source link or softer wording before they appear. The CO₂e coefficient needs a cited source.

---

## 3. Users and Roles
**Eligibility:** users must be **18 or older** (stated in the Terms and confirmed at signup).

| Role | Description | Key permissions |
|------|-------------|-----------------|
| **Visitor** | Not logged in | Public pages: landing, Help, FAQ, Contact, Team, legal, aggregate impact counters |
| **Member** | Household, student, hostel resident, individual | Inventory, recipes, nutrition, waste guide, create listings/swaps, request food, reveal contacts (verified email), impact |
| **Business** | Restaurant, canteen, caterer, banquet hall | Member powers + event pre-announcements and higher posting limits **when verified** |
| **Organisation (NGO)** | Orphanage, shelter, community kitchen, hostel, old-age home, community centre | When **verified**: receive broadcasts, see event pre-announcements, accept offers, post emergency requests |
| **Trusted authority** | For example a school/college, municipal or government office | Verified badge and normal member powers (no special emergency powers) |
| **Admin** (4 people) | Platform team | Verification, moderation, content, settings, audit — via hidden menu + MFA |

Personas: Riya (hostel student), Mrs. Das (homemaker with festival leftovers), a wedding host or caterer in Asansol, an NGO coordinator, the admin team.

---

## 4. Phases
| Phase | Theme | Contents |
|-------|-------|----------|
| 1 | Foundation | Design system, landing with live background, auth, profile, legal pages, Help/FAQ/Contact shell, Team page |
| 2 | Scan & Track | Add food (camera/gallery/barcode/manual), confirmation, inventory, freshness, Use This First, risk score, Before You Buy |
| 3 | Alerts, Recipes, Nutrition | In-app + web-push alerts, recipe rescue, nutrition planner |
| 4 | Share & Community | Listings, Available Food (list + map), swap, events, requests, pickup code, organisations, verification, admin area, emergency, moderation |
| 5 | Waste & Impact | Waste guide, recycling log, dashboard, badges, streaks |
| 6 | Polish & Launch | Bengali and Hindi, accessibility and performance passes, SEO, launch checks |

---

## 5. Functional Requirements
Priority: **M** Must · **S** Should · **C** Could.

### 5.1 Accounts, Login, Profile (FR-AUTH, FR-PROF)
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AUTH-1 | Sign up with name, email, password (phone optional). | M |
| FR-AUTH-2 | Email + password login; persistent session ("stay signed in"). | M |
| FR-AUTH-3 | Continue with Google. | S |
| FR-AUTH-4 | Email verification and forgot/reset password (generic responses, single-use links). Until verified, users can browse but cannot post, request, reveal contacts or apply as an organisation. | M |
| FR-AUTH-5 | Account type at signup: Member, Business or Organisation (organisation routes to verification). | M |
| FR-AUTH-6 | Log out, log out of all devices; delete account and data. | M |
| FR-AUTH-7 | Rate-limit and protect against repeated failed logins. | M |
| FR-AUTH-8 | Change password (requires current password) and change email (confirm new address); other sessions revoked. | M |
| FR-AUTH-9 | Confirm "I am 18 or older" and accept Terms/Privacy at signup. | M |
| FR-PROF-1 | Profile: name, avatar, optional phone, city/area, optional coarse home location, household size, language, theme, Reduce-animations, notification preferences. | M |
| FR-PROF-2 | Optional diet/body details for nutrition: diet preference, allergies, height, weight, birth year, sex (for the BMR formula), activity level. | M |
| FR-PROF-3 | Profile shows personal impact, badges and streaks. | M |
| FR-PROF-4 | Privacy controls and a clear explanation of what others can see. | M |

### 5.2 Adding Food (FR-ADD)
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-ADD-1 | **Take a photo** (with **Retake**) and **Upload from gallery**. | M |
| FR-ADD-2 | Scan a barcode to pre-fill from Open Food Facts. | M |
| FR-ADD-3 | Manual entry always available. | M |
| FR-ADD-4 | OCR/AI suggestions with per-field confidence on an **editable confirmation screen**. | M |
| FR-ADD-5 | Fields: name, category, quantity + unit, purchase date, expiry/best-before, storage (room/fridge/freezer), packaging, veg/non-veg/egg label, FSSAI status, photo, notes. | M |
| FR-ADD-6 | Categories: Packaged, Vegetables, Fruits, Meat/Fish/Egg, Dairy, Grains/Pulses, Bread/Bakery, Cooked food, Beverages, Other. | M |
| FR-ADD-7 | No expiry date → estimated shelf life from the category + storage table; user can override. | M |
| FR-ADD-8 | Cooked food records cooking time; freshness is counted in hours. | M |
| FR-ADD-9 | Quick-add for repeat items; bulk add from a receipt or shelf photo. | S |
| FR-ADD-10 | Photos compressed and **location data stripped on the device** before upload. | M |

### 5.3 FSSAI Check (FR-FSSAI) — flag and guide
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-FSSAI-1 | For **packaged** food, detect or ask whether the FSSAI mark/licence number is visible. | M |
| FR-FSSAI-2 | If missing, show a clear warning ("may not meet Indian labelling rules; do not consume if unsure"). | M |
| FR-FSSAI-3 | Offer next steps: keep proof, return to the seller, and a link/instructions to the official complaint channel. The app does not file complaints for the user. | M |
| FR-FSSAI-4 | Flagged items cannot be listed for sharing. | M |
| FR-FSSAI-5 | Skipped for loose produce, fresh cooked and home-made food. | M |

### 5.4 Tracking, Freshness, Alerts (FR-TRACK)
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-TRACK-1 | Inventory with search, filters and sort (soonest expiry by default). | M |
| FR-TRACK-2 | Status 🟢 Fresh · 🟡 Consume soon · 🔴 Expiring/expired, always colour + icon + text. | M |
| FR-TRACK-3 | Freshness score 0–100 from time left, category risk and storage; thresholds admin-tunable. | M |
| FR-TRACK-4 | **"Use This First" shelf** highlights what to eat earliest. | M |
| FR-TRACK-5 | **Food Waste Risk Score** (Low/Medium/High) from expiry, quantity, storage and the user's history. | M |
| FR-TRACK-6 | Alerts: close to expiry, consume soon, expired, can be shared/donated, packaging recyclable. | M |
| FR-TRACK-7 | Personalised copy, for example "Your milk expires tomorrow. Consider using it today." | M |
| FR-TRACK-8 | Channels: in-app (always), web push (opt-in), email digest (opt-in). | M/S |
| FR-TRACK-9 | Quiet hours, lead time, per-channel toggles. | S |
| FR-TRACK-10 | **Action ladder:** Consume → Share → Donate → Reuse → Recycle → Responsible disposal, with the best suggestion for the item. | M |
| FR-TRACK-11 | Closing an item records the outcome and updates impact. | M |
| FR-TRACK-12 | **Raw meat, fish and eggs can be tracked but never listed, shared, donated or swapped.** Cooked dishes containing them go under Cooked food and may be listed. | M |

### 5.5 Before You Buy (FR-BUY)
| FR-BUY-1 | Scan a barcode (or search) in a shop without adding it to the inventory. | M |
|---|---|---|
| FR-BUY-2 | Say whether the same or a similar item is already at home, with quantity and expiry. | M |
| FR-BUY-3 | "Add to shopping list" / "Skip". | S |

### 5.6 Recipes and Nutrition (FR-RECIPE, FR-NUT)
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-RECIPE-1 | Recipe Rescue ranks recipes that use the most near-expiry items. | M |
| FR-RECIPE-2 | Detail: name, image, ingredients (have/need), steps, time, calories, nutrients, veg tag. | M |
| FR-RECIPE-3 | Library emphasises **Indian and Bengali home cooking** (team-authored, ≥ 100 at launch). | M |
| FR-RECIPE-4 | Diet and allergies are **hard filters**. | M |
| FR-RECIPE-5 | "I cooked this" deducts ingredients after confirmation. | S |
| FR-NUT-1 | BMI, daily calories, protein/carb/fat targets from the profile. | M |
| FR-NUT-2 | Meal suggestions that use ingredients already at home. | M |
| FR-NUT-3 | General-guidance disclaimer; no weight-loss targets for under-25s is not required (service is 18+), but show "consult a professional" for pregnancy/medical conditions. | M |
| FR-NUT-4 | Weekly meal plan. | C |

### 5.7 Sharing, Donating, Swapping, Events (FR-SHARE)
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-SHARE-1 | Listing fields: kind (donate/share/swap/event surplus), title, description, category, diet label (donor must choose), quantity, "feeds about N people", prepared time (cooked), storage note, containers available, **1–4 photos (required)**, static map pin, area label, availability window, pickup contact (name + phone, may differ from the account holder). | M |
| FR-SHARE-2 | Mandatory **sender confirmation** (versioned text) before publishing; timestamps stored. | M |
| FR-SHARE-3 | **Availability window:** the donor picks the end time; presets plus custom; each category has an admin-set maximum that can never exceed a **48-hour hard ceiling**; cooked food has much lower limits and a maximum age since preparation; donors can extend (within limits) or end early. | M |
| FR-SHARE-4 | Rules by category; **meat/fish/egg locked**; FSSAI-flagged items blocked; high-risk limits admin-adjustable except the locked category. | M |
| FR-SHARE-5 | **Contact visibility:** by default, **logged-in, email-verified users can reveal the pickup contact during the window** (one tap, rate-limited, logged). The donor may instead choose "only after I approve a request". Access ends automatically when the window ends. | M |
| FR-SHARE-6 | **Available Food** page: all listable items in one place, list + map in sync, **default order: ending soonest, then nearest**; tabs All/Events/Homes/Swaps; filters (distance, category, veg/non-veg, time left, verified only). | M |
| FR-SHARE-7 | **Smart Food Swap:** mark a listing as a swap with what you would like in return; others propose; accepted proposals create the usual request records. | M |
| FR-SHARE-8 | **Nearby organisations** layer: verified organisations first (✔), other places marked "Not verified by Khabar Chakra". | M |
| FR-SHARE-9 | **Broadcast** to verified organisations within a radius (default 1.5 km, widening on request); they accept or decline. | M |
| FR-SHARE-10 | Lifecycle: draft → scheduled → open → reserved → completed, or expired/cancelled/removed; unclaimed listings prompt the donor with the fallback (consume, compost, recycle). | M |
| FR-SHARE-11 | Report a listing or user. | M |
| FR-SHARE-12 | Block a user (both ways). | M |
| FR-SHARE-13 | In-app chat; thank-you or rating after pickup. | C |
| FR-SHARE-14 | **Event mode:** verified hosts/caterers/banquet halls pre-announce an event (up to 30 days ahead) to verified organisations nearby; organisations tap "We'll pick up"; at surplus time the host posts an event listing prefilled from the event. | M |
| FR-SHARE-15 | **Pickup code:** on approval the donor sees a 6-digit code; the recipient enters it at handover to complete the pickup (limited attempts, expiry). Donors may also close manually. | M |
| FR-SHARE-16 | Listing text fields **reject or mask phone numbers and email addresses** so contacts stay behind the reveal rules. | M |
| FR-SHARE-17 | Notifications for requests, approvals, window ending soon and ended. | M |
| FR-SHARE-18 | Posting limits per day (default 10; higher when verified). | M |
| FR-SHARE-19 | Location: exact for venues; approximate (fixed small offset) for homes; **distances use the public pin only**. | M |
| FR-SHARE-20 | Safety tips at pickup (public place, tell someone, no payments). | M |
| FR-SHARE-21 | Quick/bulk listing and staff accounts for businesses ("canteen mode"). | C |

### 5.8 Organisation Verification and Badges (FR-NGO)
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-NGO-1 | Application for four kinds: **NGO/organisation, caterer, banquet hall, trusted authority** — name, type, registration details, address + static pin, service area, food preferences, capacity, contact person, contact details. | M |
| FR-NGO-2 | **Document upload per kind.** NGO: registration certificate, 12A/80G or NGO Darpan ID where applicable, PAN, address proof, authorised-person ID, premises photo. Caterer/banquet: valid FSSAI licence, business registration or trade licence, address proof, owner ID, premises photo. Authority: official letter or ID card, designation letter, official email where available. | M |
| FR-NGO-3 | Status: Submitted → Under review → Needs more info → Approved / Rejected (and Suspended). The applicant sees the reason. | M |
| FR-NGO-4 | Documents are **private**: owner and admins only, short-lived links, every view audited. | M |
| FR-NGO-5 | Admin queue with case claiming; the admin **must open every required document and mark it reviewed before Approve is enabled**. | M |
| FR-NGO-6 | **Verified badge:** a unique green leaf-shaped tick with a tooltip on hover/focus/tap ("Verified NGO", "Verified Caterer", "Verified Banquet Hall", "Verified Trusted Authority" + "Documents reviewed by Khabar Chakra"). Shown only for approved status. | M |
| FR-NGO-7 | Suspension or revocation removes the badge and access immediately; re-verification reminder yearly. | M |
| FR-NGO-8 | Email and in-app notices on every status change. | M |
| FR-NGO-9 | **Two-admin rule:** approving a trusted authority and permanently revoking or restoring any badge need a second admin; one admin may suspend immediately in an emergency, reviewed by a second within 24 h. | M |
| FR-NGO-10 | Unverified businesses may post with lower limits and no badge. | M |

### 5.9 Emergency Food Sharing (FR-EMERG) — verified organisations only
| FR-EMERG-1 | Verified **NGOs** post an urgent request: need, people, deadline, location, contact. | M |
|---|---|---|
| FR-EMERG-2 | Nearby users see a highlighted feed and can offer matching food in one tap. | M |
| FR-EMERG-3 | Optional alerts to nearby users who opted in. | S |
| FR-EMERG-4 | Requests auto-expire at the deadline; admins can remove abusive ones. | M |
| FR-EMERG-5 | Authorities and caterers have no special emergency powers. | M |

### 5.10 Waste Disposal and Upcycling (FR-WASTE)
| FR-WASTE-1 | "What waste did you generate?" selector across organic, peels, cooking waste, plastic, bottles, milk/dairy packaging, paper/cardboard, metal cans, glass, special waste. | M |
|---|---|---|
| FR-WASTE-2 | Card per item: What is it? · Reuse? · Recycle? · Compost? · Where to dispose? | M |
| FR-WASTE-3 | Clear steps (for example milk packet: empty → rinse → dry → keep with recyclables → hand to collector). | M |
| FR-WASTE-4 | Nearby drop points on the map (open data + curated Asansol list). | M |
| FR-WASTE-5 | "May vary by local waste system" notice; user corrections welcome. | M |
| FR-WASTE-6 | Recycling log (type + weight). | M |
| FR-WASTE-7 | Upcycling ideas. | S |

### 5.11 Impact (FR-IMPACT)
| FR-IMPACT-1 | Personal dashboard: food saved (kg), ₹ saved, waste composted/recycled, donations completed, CO₂e avoided. | M |
|---|---|---|
| FR-IMPACT-2 | Animated charts; published formulas for every number; text alternatives. | M |
| FR-IMPACT-3 | Badges, streaks, optional opt-in leaderboard; **points have no cash value**. | M |
| FR-IMPACT-4 | Public aggregate counters on the landing page once real data exists (otherwise "We're just getting started"). | S |

### 5.12 Public Site, Help, Contact (FR-SITE)
| ID | Requirement | Pri |
|----|-------------|-----|
| FR-SITE-1 | Landing page: hero with live animated/3D background, the 4R loop (Scan → Track → Rescue → Recycle), Events section, how sharing works, verified partners (only real ones), waste/recipe teasers, FAQ preview, install-as-app. | M |
| FR-SITE-2 | **Team page:** team name, college, story, four members' names, titles and bios; **no phone, email or social links**. | M |
| FR-SITE-3 | **Contact page** with a protected form (topics include food info, donation, tech support, partnership, distribution, privacy request); messages go to the **admin inbox**; no team email/phone is exposed. | M |
| FR-SITE-4 | **Technical support shows "Coming soon"** until the team publishes details (controlled from admin settings). | M |
| FR-SITE-5 | Legal pages: Terms of Use, Privacy Policy, Food-Safety Disclaimer, Community Guidelines. | M |
| FR-SITE-6 | Installable PWA with offline shell and read-only last-seen inventory. | S |
| FR-SITE-7 | **Help Centre:** Getting started, For donors, For event hosts and caterers, For organisations, Food safety, Waste guide, Troubleshooting. | M |
| FR-SITE-8 | **FAQ** with categories, search, deep links and a **fully working accordion** (mouse and keyboard); content editable by admins. | M |
| FR-SITE-9 | **Footer** with Help/FAQ/Contact/legal links, language switcher, and a last line **"Made by The S-QUAD"** linking to the Team page. | M |
| FR-SITE-10 | SEO basics for public pages; private pages are not indexed. | M |
| FR-SITE-11 | Language switcher (English at launch; Bengali and Hindi in Phase 6). | M |
| FR-SITE-12 | Light/Dark/System theme and a "Reduce animations" toggle. | M |

### 5.13 Admin Area (FR-ADMIN)
| FR-ADMIN-1 | **No separate admin login page.** Admins sign in normally; an "Admin" menu item appears only for them; entering requires an authenticator-app code. | M |
|---|---|---|
| FR-ADMIN-2 | Anyone else requesting an admin address sees the same "Page not found" as for any unknown address. | M |
| FR-ADMIN-3 | Four admin accounts, each with two registered authenticator devices; idle timeout 30 minutes; sign-in alerts. | M |
| FR-ADMIN-4 | Verification queue, document viewer, decisions with reasons, case claiming (FR-NGO-5, FR-NGO-9). | M |
| FR-ADMIN-5 | Moderation queue: reports, listing removal/restore, suspensions. | M |
| FR-ADMIN-6 | Content: FAQ, help articles, waste guide, shelf-life tables, listing rules (within limits), site settings (including tech-support status). | M |
| FR-ADMIN-7 | Contact inbox with status and internal notes. | M |
| FR-ADMIN-8 | Read-only audit log of admin actions. | M |
| FR-ADMIN-9 | Basic analytics summary. | S |

### 5.14 Safety and Moderation (FR-SAFE)
| FR-SAFE-1 | Reports on listings/users with reasons; three distinct reports auto-pause a listing pending review. | M |
|---|---|---|
| FR-SAFE-2 | Urgent reports (unsafe food, threats, harassment) reviewed first; suspension takes effect immediately when risk is credible. | M |
| FR-SAFE-3 | Sender confirmation and timestamps stored for every listing (audit trail). | M |
| FR-SAFE-4 | "You decide whether the food is safe to accept" shown on listings and in the Terms. | M |
| FR-SAFE-5 | Users can appeal a suspension through the contact form. | S |

### 5.15 Map (FR-MAP) — West Bengal focus
| FR-MAP-1 | Interactive map with a list-view alternative; clustering; countdown on pins. | M |
|---|---|---|
| FR-MAP-2 | Opens centred on the user's area, or **Asansol** by default; outside West Bengal shows a friendly "focused on West Bengal for now" note. | M |
| FR-MAP-3 | Donors choose a **static pin** by tapping the map, searching an address or using their location (permission asked once). | M |
| FR-MAP-4 | Places layer (organisations, recycling, compost, scrap dealers, community gardens) from open data plus a curated Asansol list; Bengali names shown when available. | M |
| FR-MAP-5 | Address search through free services called from the server and cached; the pin can always be dragged. | M |
| FR-MAP-6 | "Open in Maps" button for directions (no routing service). | M |
| FR-MAP-7 | Required map attribution always visible. | M |

---

## 6. Non-Functional Requirements
- **Cost:** ₹0 recurring; features degrade gracefully when free limits are reached.
- **Performance:** mobile LCP ≤ 3 s; heavy visuals lazy-loaded and **auto-reduced** on weak devices or reduced-motion; 3D scene loaded only on the landing page; AI models load only when Add Food opens.
- **Accessibility:** WCAG 2.1 AA; keyboard operable; status never by colour alone; reduced-motion respected.
- **Security and privacy:** SECURITY.md applies — row-level access rules on all data, private documents, hidden contacts, audit logs; service is 18+.
- **Reliability:** idempotent alert jobs; keep-alive; weekly encrypted backups stored **outside the public repo**.
- **Compatibility:** latest two versions of Chrome, Edge, Safari, Firefox; Android and iOS browsers; from 360 px width.
- **Internationalisation:** all text in message files from day one; English at launch; Bengali and Hindi in Phase 6; Indian formats (₹, DD/MM/YYYY).

---

## 7. Design Direction (details in DESIGN SYSTEM)
- **Palette "Market Fresh":** Basil green (primary), Mango yellow (accent), Chilli red (urgency only), Blueberry blue (information), mint-white and moss-night neutrals. It is independent of the logo colours.
- **Type:** Caveat (cursive handwriting) for short accents + Nunito for everything else; Bengali/Hindi companions Atma/Kalam with Hind Siliguri/Hind.
- **Logo:** bowl mark + Bengali wordmark + English wordmark + tagline; **no Hindi line**.
- **Live background:** 3D food garden on the landing page; lighter animation inside the app; static fallback.
- **Verified badge:** unique green leaf-tick with tooltip.
- **Voice:** warm, local, concrete, never guilt-tripping.

---

## 8. Key User Flows
F1 First-time user: Landing → Sign up (18+) → Verify email → Onboarding → Add first food → See freshness.
F2 Add food: Add → Photo/Upload/Barcode/Manual (Retake) → suggestions → Confirm & edit → FSSAI check (packaged) → Save.
F3 Expiring item: Alert → Recipes / Share / Mark consumed → Impact updated.
F4 Share food: Create listing (photos, pin, window, consent) → Live on Available Food → Request → Approve → Pickup code → Completed. Unclaimed → fallback prompt.
F5 Event: Host pre-announces → Organisations tap "We'll pick up" → Host posts surplus → Pickup.
F6 Organisation verification: Apply → Upload documents → Admin reviews every document → Approved/Needs info/Rejected → Badge.
F7 Emergency: Verified NGO posts need → Nearby users offer → Pickup.
F8 Waste: Finish item → Choose waste → Disposal card → Drop point → Log.
F9 Before You Buy: Scan in shop → "You already have it" → Skip/Add to list.
F10 Help: Search FAQ → open answer → Contact form if needed.

---

## 9. Data and Content Dependencies
| Need | Source (free) | Note |
|------|---------------|------|
| Barcode data | Open Food Facts | Indian coverage incomplete; manual fallback |
| Shelf-life defaults | Team-curated from public guidance | Sources required; admin-editable |
| Recipes | In-house Indian/Bengali set (+ optional free API if terms allow) | ≥ 100 at launch |
| Nutrition | USDA FoodData Central + IFCT | Cite sources |
| Maps | OpenStreetMap data, Leaflet, free-tier tile provider (chosen in Phase 4) | Attribution required |
| Waste guidance | Team-curated | "May vary locally" |
| Icons, art, 3D | Open-licence assets / self-made | Licences recorded |

---

## 10. Decisions Summary (authoritative list: AGENTS.md §2)
Static pins · contact visible to logged-in verified users during the window · 48 h hard ceiling · photos required · event mode + pickup code · contact messages to admin inbox, tech support "Coming soon" · cooked food allowed · raw meat/fish/egg track-only · verified badges for NGOs, caterers, banquet halls, authorities · four admins, hidden entry, 404 parity, MFA, two-admin rule · ending-soonest order · Emergency for NGOs only · Team page and footer link · English first · backups outside the public repo · 18+ · Mumbai region · jobs as private web-app routes · Market Fresh palette, no Hindi in logo · Caveat + Nunito · West Bengal map focus.

---

## 11. Risks and Mitigations
| Risk | Mitigation |
|------|-----------|
| Inaccurate OCR/AI on free tools | Confirmation screen, confidence labels, barcode/manual fallbacks |
| Free-tier limits or database pause | Keep-alive, monitoring, backups outside the repo, graceful degradation |
| Unsafe food shared | Versioned sender confirmation, preparation limits, short windows, locked categories, reports, "recipient decides" |
| Contact scraping or harassment | Reveal rules, quotas, window expiry, approximate location, block/report, audit |
| Fake organisations | Mandatory document review, public-registry checks, two-admin rule, re-verification |
| Privacy breach | Deny-by-default access rules, private documents, minimal data, retention limits |
| Cold start (few donors/organisations) | Events focus, seeded Asansol organisations, solo-valuable tracking/recipes/waste features |
| Heavy animation | Tiers, budgets, reduced-motion |
| Legal exposure | Expert review of Terms, Privacy, disclaimers; 18+; privacy contact |
| Unsourced numbers | Placeholders clearly labelled until sourced |

---

## 12. Open Questions
1. Privacy/grievance contact before launch (interim: contact-form topic + admin inbox).
2. Cited CO₂e source; shelf-life sources; price-per-kg values.
3. Free map-tile provider (Phase 4).
4. Final licence for the public repo (MIT proposed for code; brand assets not licensed).
5. Who holds the Supabase/Vercel/GitHub owner accounts and backup keys.
6. Legal review of Terms, Privacy Policy, Food-Safety Disclaimer.
*Closed since v1.0:* Hindi logo line (removed), cooked food (allowed), repo public later, domain later, contact details ("Coming soon").

---

## 13. Release Criteria (v1.0)
- All **Must** requirements in Phases 1–5 implemented and tested (TESTING.md).
- Accessibility (WCAG 2.1 AA) on key pages in both themes; performance budgets met.
- SECURITY.md pre-launch checklist complete, including hidden-admin behaviour, private documents, contact-reveal rules and window expiry.
- Legal pages published and expert-reviewed; food-safety disclaimer visible on listings.
- Deployed on free hosting with working auth, database, storage, email and push; backups and keep-alive verified.
- Bengali and Hindi files reviewed (Phase 6).

---

## 14. Feature Coverage Matrix (every source idea → requirement)
| Source idea | Where it lives |
|-------------|----------------|
| Sign-up/login with name, email/phone, password | FR-AUTH-1…9 |
| Photo capture, retake, gallery upload | FR-ADD-1, FR-ADD-10 |
| Stored fields (name, category, quantity, dates, storage, packaging, veg/non-veg, shelf life, FSSAI) | FR-ADD-5…8, FR-FSSAI |
| FSSAI missing → warning, return, complaint | FR-FSSAI-1…5 (flag-and-guide) |
| Continuous tracking and notifications | FR-TRACK-1…9 |
| Consume → Share → Donate → Reuse → Recycle → Dispose | FR-TRACK-10, FR-WASTE |
| Recipe suggestions and nutrition/diet | FR-RECIPE, FR-NUT |
| Donate/share with contact and location | FR-SHARE-1…6, 19 |
| Smart Food Swap | FR-SHARE-7 |
| "Use This First" shelf | FR-TRACK-4 |
| Food Waste Risk Score | FR-TRACK-5 |
| Emergency Food Sharing | FR-EMERG |
| "Before You Buy" scanner | FR-BUY |
| Nearby organisations map | FR-SHARE-8, FR-MAP |
| Waste guide, recycling log, impact dashboard | FR-WASTE, FR-IMPACT |
| Event food wastage (weddings) | FR-SHARE-14, 15 |
| Time-boxed visibility of location/contact | FR-SHARE-3, 5 |
| Verified badges (NGO, caterer, banquet, authority) | FR-NGO |
| Hidden admin and document review | FR-ADMIN, FR-NGO-5, 9 |
| Help, FAQ, contact, tech-support "Coming soon", Team page, footer credit | FR-SITE-2…9 |
| Light/Dark mode, live background, interactive UI | FR-SITE-12, DESIGN SYSTEM |
| Restaurant/canteen mode, tokens, receipt scan (deck) | FR-SHARE-21, FR-IMPACT-3, FR-ADD-9 |
| Future scope (deck): inventory prediction, municipal pickup routing, IoT freshness sensors, recycling-point integrations, certified carbon estimates, multilingual voice | Later (post-v1) |

---
*End of PRD v1.1.*