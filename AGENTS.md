# AGENTS.md — Instructions for AI Coding Assistants

> **Version 2.0 · Status: Pivot to Personal Household Food Lifecycle & Waste Prevention.** Audience: any AI coding agent (Claude Code, Codex, Cursor, Copilot, etc.) working in this repository.
> **Project:** Khabar Chakra (খাবার চক্র) — a 100% free, domestic kitchen food-lifecycle intelligence platform: OCR intake & smart tracking → dynamic freshness & "Use This First" urgency shelves → "Before You Buy" duplicate prevention → recipe rescue from expiring pantry items → domestic waste & ₹ savings analytics.
> **Humans:** The S-QUAD (students). They rely on you for safe, clean, reliable code with ₹0 operating cost.
> Keep this file as the single source of truth.

---

## 0. Core Pivot & Non-Negotiables
1. **Focus 100% on Household & Personal Food Intelligence:** All public food surplus sharing, community map pins, event pre-announcements, pickup verification codes, and NGO badges are completely omitted. The platform is dedicated to domestic kitchens, pantry management, and zero food waste.
2. **Cost must stay ₹0:** No paid APIs, services, or paid tiers. Use browser-native APIs, free open data (Open Food Facts), on-device OCR, and Supabase free tier.
3. **Privacy by Default:** A user's pantry and fridge inventory is strictly private to their account, enforced via Supabase Row-Level Security (`auth.uid() = owner_id`).
4. **Real Authentication, No Fake Data:** Connect directly to Supabase Google OAuth and email sessions. Never display hardcoded user names or mock identities; use real user metadata or an explicit placeholder (`eg. Home Chef`).
5. **Every change ships with tests and updated docs.**

---

## 1. Five Core Pillars of Khabar Chakra

| Pillar | Purpose & Capabilities |
|---|---|
| **1. Advanced Inventory Tracking** | Multi-zone storage (Fridge, Freezer, Pantry). Instant OCR reading for grocery receipts and packaging expiry dates (via Tesseract.js/vision). Open Food Facts barcode lookup with nutrition metadata. |
| **2. Smart Freshness & Risk Scoring** | Real-time mathematical freshness index (0–100%) and color-coded bands (🟢 Fresh · 🟡 Consume soon · 🔴 Expiring). Dynamic Household Waste Risk Scores and automated **"Use This First"** smart shelf triage. |
| **3. "Before You Buy" Kitchen Intelligence** | Real-time grocery shopping assistant. Cross-references planned shopping items against current fridge and pantry stock to eliminate duplicate purchases and overbuying. |
| **4. Recipe Rescue & Meal Planning** | Inventory-driven recipe generator. Prioritizes ingredients about to expire in the user's pantry, calculating macro and calorie estimates to turn potential waste into complete meals. |
| **5. Household Waste & ₹ Savings Analytics** | Live dashboard tracking domestic rupees saved (₹ avoided waste), food weight rescued (kg), domestic CO₂e diverted, and personal zero-waste streak counters. |

---

## 2. Binding Architectural Decisions

| # | Decision |
|---|----------|
| D1 | **Household Scoped:** All inventory and meal tracking is private to the authenticated user. No public listings or geo-tracking. |
| D2 | **Google & Supabase Auth:** Primary authentication via Supabase Google OAuth (`signInWithOAuth`), with Email OTP fallback. No hardcoded or fake users. |
| D3 | **Dynamic Freshness Engine:** Categorical shelf-life models calculate hours remaining; food is categorized into `fresh`, `consume_soon`, `expiring`, and `expired`. |
| D4 | **"Use This First" Smart Shelf:** Automated prioritization queue for items expiring within 24–48 hours, with direct links to Recipe Rescue. |
| D5 | **"Before You Buy" Assistant:** Smart search and checklist comparing user inputs against active home inventory to prevent redundant grocery spend. |
| D6 | **Theme & Accessibility:** Dual Light/Dark mode with a persistent working toggle. High contrast (≥ 10:1 ratio) in both modes with emerald/basil ambient glow. |
| D7 | **Cost Ceiling:** ₹0 strictly enforced. Client-side OCR and free open food databases only. |
| D8 | **Live Dynamic Background:** Lightweight canvas ambient botanical leaf and mote animations running smoothly without blocking interaction. |
| D9 | **Fonts:** Google Font pairings: Montserrat (body/structure), Sacramento and Great Vibes (cursive titles and accents), Yellowtail and Bad Script (badges and stamps). |
| D10 | **Supabase Region:** Mumbai. |

---

## 3. Tech Stack at a Glance
- **Framework:** Next.js (App Router, Next.js 16 line) + React 19 + TypeScript (`strict`).
- **Styling:** Tailwind CSS + custom Kitchen Almanac tokens + high-contrast Light/Dark mode.
- **Backend:** Supabase (Postgres, Row-Level Security, Auth, Storage).
- **Intake & Intelligence:** Tesseract.js (client-side receipt OCR), Open Food Facts API (barcodes), custom Freshness & Shelf-Life domain engine.
- **Testing:** Vitest, typecheck (`tsc --noEmit`), and custom design linter (`scripts/design-lint.mjs`).

---

## 4. Final Report & Verification
Before marking tasks complete:
1. Run `npm test` (all unit tests passing).
2. Run `npm run lint:design` (no banned gradient or design violations).
3. Run `npm run typecheck` (zero TypeScript errors).
4. Run `npm run build` (successful production build).