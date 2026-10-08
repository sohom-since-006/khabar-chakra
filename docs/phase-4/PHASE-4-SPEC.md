# PHASE 4 SPEC — Share & Community

> **Version 1.0** · Status: Final, ready for implementation · Governed by AGENTS.md v1.1, PRD v1.1 §5.5 & §5.7–5.10, TRD §4.3 & §6, BACKEND SCHEMA §8 & §11, DESIGN SYSTEM v1.1.
> **Goal:** Build the community food rescue engine: public listings with strict photo requirements and 48h windows, Available Food directory with Leaflet interactive map, secure contact reveal with 6-digit pickup handover, organisation verification with admin audit queue, and emergency food sharing flags.
> **Binding Invariants Enforced:**
> - **D1:** Static map pins only. Zero live GPS tracking.
> - **D2 & BACKEND SCHEMA §8.3:** Contact details revealed only via `reveal_contact()` RPC and RLS to verified users during live window.
> - **D3:** Strict 48-hour hard ceiling on listing availability window.
> - **D4:** 1–4 photos mandatory for publishing any listing; EXIF and device location stripped on-client.
> - **D5:** Event surplus mode with 6-digit perforated pickup code.
> - **D8:** Raw meat, fish, and eggs (`meat_fish_egg`) are permanently forbidden from being shared/donated/swapped (`isListable = false`).
> - **D9 & D21:** Verified badges for approved NGOs/caterers; two-admin approval rule for authorities.
> - **D10:** Admin console under `/[locale]/admin` hidden behind server verification; 404 for unauthorized users.
> - **D11:** Available Food default sort: Ending soonest, then nearest.
> - **D12:** Emergency Food Sharing reserved exclusively for verified NGOs.
> - **D24:** Leaflet + OpenStreetMap tiles, default centre Asansol (23.6889° N, 86.9661° E), external directions link.

---

## 1. Scope & Modules
1. **Listing Creation & Management (`/[locale]/share/new`, `/[locale]/share/[id]`):**
   - Ingestion modal/page turning pantry item or new surplus into a public listing.
   - 1–4 photos required with client EXIF strip.
   - Enforce D8: rejects `meat_fish_egg` with explanation.
   - Window duration selector (maximum 48h; cooked food recommended 4–12h).
   - Location choice: Exact pin vs. Approximate pin (~500m fuzzing).
   - Contact reveal preference: "Instant to verified users" vs. "Only after I approve request".
2. **Available Food Directory & Leaflet Map (`/[locale]/available`):**
   - Two view modes: Gazette Classifieds rail (cards) and Interactive Map (Leaflet OSM pins).
   - Default sort order: Ending soonest, then nearest (D11).
   - Filter controls: Kind (Donate, Share, Swap, Event Surplus), Diet (Veg, Vegan, Egg, Non-Veg), Verified Organisations only, Emergency flag.
   - Listing detail sheet (`/[locale]/available/[id]`): Photo gallery, countdown timer, static location map, verified badge with explanatory tooltip.
3. **Contact Handover & Pickup Code (`reveal_contact()` & Handover Sheet):**
   - Unrevealed state: Displays donor name/handle and approximate area, contact hidden behind "Reveal Pickup Contact" button.
   - Revealing triggers verification check and logs audit entry.
   - 6-digit pickup code generated for donor; recipient enters code to confirm handover.
4. **Organisation Verification & Admin Area (`/[locale]/admin`):**
   - Organization application form (`/[locale]/organisations/register`).
   - Admin audit queue (`/[locale]/admin/verifications`): Document viewer (60s signed link simulation), case claiming, two-admin approval tracking (D21).
   - Standard 404 `notFound()` thrown for non-admin accounts (D10).
5. **Emergency Food Sharing (`/[locale]/emergency`):**
   - Dedicated NGO broadcast channel (D12).
   - Bulk surplus alerts for rapid distribution to verified community kitchens.

---

## 2. Acceptance Criteria
- **AC-SHARE-01:** Listing creation enforces 1–4 photos, ≤ 48h duration, and blocks raw meat/fish/egg.
- **AC-SHARE-02:** Available food listings default to ending soonest, then nearest.
- **AC-SHARE-03:** Contact details are masked until `reveal_contact` is triggered.
- **AC-SHARE-04:** 6-digit pickup code enables successful handover and marks listing as claimed/closed.
- **AC-ADMIN-01:** Non-admin users visiting `/[locale]/admin` receive a standard 404 not found page.
- **AC-ORG-01:** Verified badge shows green leaf-tick with tooltip stating documents were reviewed and food is not certified.
