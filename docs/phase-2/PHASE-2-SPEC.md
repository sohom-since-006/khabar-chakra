# PHASE 2 SPEC — Scan & Track (Inventory & Freshness)

> **Version 1.0** · Status: Final, ready for implementation · Depends on PRD v1.1 §5.2–5.5, TRD §3 / §5, BACKEND SCHEMA §6, DESIGN SYSTEM v1.1, AGENTS v1.1.
> **Goal:** Complete on-device capture and pantry inventory system: Add Food (camera/barcode/manual), editable proof-sheet confirmation, freshness countdown bands, "Use This First" shelf, waste risk scoring, and "Before You Buy" pantry checker.
> **Binding Invariants Enforced:**
> - ₹0 cost ceiling (client-side classification, Open Food Facts free API, no paid APIs).
> - Zero certifying of food safety ("Recipient decides").
> - Private Household Data (D1): Inventory is strictly private to the authenticated user via RLS (auth.uid() = owner_id); zero public listings.
> - "The Kitchen Almanac" art direction (ruled ledgers, status badges, hairline rules, Nunito + Caveat annotations, 78-icon SVG sprite).

---

## 1. Scope
**In:**
- Domain logic (`src/domain/freshness.ts`, `src/domain/wasteRisk.ts`, `src/domain/shelfLife.ts`):
  - Freshness score (0–100) and 4 status bands: 🟢 Fresh, 🟡 Consume soon, 🔴 Expiring, ⬛ Expired (color + icon + text).
  - Food Waste Risk score (Low / Medium / High) from quantity, storage, category risk, and shelf life.
  - Shelf-life default estimates by (category, storage) with marked sources.
  - FSSAI flag-and-guide validator (14-digit license validation and guidance notes).
  - Open Food Facts barcode lookup integration with local caching.
- Add Food Viewfinder (`/[locale]/inventory/add`):
  - Tab modes: Viewfinder capture with live simulated scanner, Barcode detection, and Manual ledger entry.
  - EXIF location data stripped on device before image storage.
  - Editable Confirmation Proof Sheet with confidence cues before saving.
- "Before You Buy" pantry checker (`/[locale]/inventory/check`):
  - In-shop barcode/name search checking existing home inventory to prevent duplicate buying.
- Kitchen Inventory Dashboard (`/[locale]/home` and `/[locale]/inventory`):
  - Ruled ledger table / cards with density switcher.
  - "Use This First" priority shelf highlighting expiring items.
  - Category, storage, and band filters; search by name.
  - Item Action Ladder: Consume, Cook, Share (link to Phase 4), Compost, Dispose.
  - Item closure modal recording waste outcome.

**Out (Phase 3 & 4):**
- Automated pg_cron / push notifications (Phase 3).
- Public surplus sharing marketplace and map pins (Phase 4).

---

## 2. Requirements & Acceptance Criteria

### US-P2-01 Add Food Entry
- **AC 01.1:** Given a user opens Add Food, they can choose between Viewfinder/Camera, Barcode scan, or Manual entry.
- **AC 01.2:** Given a user scans a barcode, if found in Open Food Facts, product name, category, brand, and packaging prefill automatically into the editable confirmation screen.
- **AC 01.3:** Given a user inputs cooked food, cooking time is recorded and freshness countdown is measured in hours.
- **AC 01.4:** Given no expiry date is specified, the system estimates expiry from the category and storage defaults (e.g. Dairy in Fridge = 72 hours) with an explicit source note.
- **AC 01.5:** Photos have all EXIF metadata stripped on device before upload.

### US-P2-02 FSSAI Verification
- **AC 02.1:** Packaged food prompts for FSSAI status. If 14-digit license is provided, it validates format; if missing or invalid, an informational caution guide is presented ("May not meet Indian labelling standards").
- **AC 02.2:** Loose vegetables, fruits, and homemade food skip FSSAI checking.
- **AC 02.3:** Flagged packaged food cannot be marked for public sharing.

### US-P2-03 Freshness Bands & "Use This First"
- **AC 03.1:** Freshness score is computed between 0 and 100 based on hours remaining versus total shelf-life.
- **AC 03.2:** Items are assigned to one of four bands:
  - 🟢 **Fresh**: > 48h remaining (or > 60% shelf life).
  - 🟡 **Consume Soon**: 24–48h remaining (or 20–60% shelf life).
  - 🔴 **Expiring**: < 24h remaining (or < 20% shelf life).
  - ⬛ **Expired**: Deadline passed.
- **AC 03.3:** The inventory displays a prominent "Use This First" shelf listing all items in the 🔴 Expiring and 🟡 Consume Soon bands.

### US-P2-04 "Before You Buy" Assistant
- **AC 04.1:** Users can scan or type a grocery product in a shop.
- **AC 04.2:** The assistant reports whether the same or similar item already exists in home inventory, its remaining quantity, and current freshness band.

### US-P2-05 Binding Food Safety Rule (D8)
- **AC 05.1:** Raw meat, fish, and eggs (`meat_fish_egg`) can be stored and tracked in private inventory, but their `isListable` flag is permanently locked to `false`.

---

## 3. Test Coverage Strategy
- Unit tests (`tests/unit/domain/freshness.test.ts`, `wasteRisk.test.ts`, `fssai.test.ts`):
  - Golden vectors for shelf life calculations.
  - Half-up rounding for score and risk computations.
  - FSSAI 14-digit format validation.
  - Absolute lockdown of raw meat/fish/egg listing eligibility.
