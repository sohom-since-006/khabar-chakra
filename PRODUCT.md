# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users: Domestic households, home cooks, and families managing groceries, fridge contents, and pantry staples in India and worldwide. They need a zero-friction, private way to track food freshness, prevent duplicate grocery purchases while shopping, and rescue expiring ingredients into nourishing meals without guilt or complex spreadsheets.

## Product Purpose

Khabar Chakra (খাবার চক্র) transforms domestic kitchen food management into effortless financial savings and zero food waste. It gives households real-time visibility into what they already own, alerts them dynamically when items near expiration, calculates domestic rupee (₹) savings from avoided waste, and instantly generates complete recipes from ingredients waiting in their fridge and pantry.

## Positioning

Unlike public surplus-donation networks or commercial restaurant inventory SaaS, Khabar Chakra is a 100% private, domestic kitchen intelligence companion with zero operating cost. Inventory is strictly private via Supabase Row-Level Security (`auth.uid() = owner_id`), intake is powered by instant on-device receipt OCR and barcode lookup (Open Food Facts), and intelligence is driven by a localized dynamic freshness decay algorithm tailored to Indian kitchen staples.

## Operating Context

- Mobile web in the grocery store: quick "Before You Buy" search to avoid buying duplicates.
- Desktop or tablet in the kitchen: daily inventory check, meal planning, and receipt OCR scanning upon returning from weekly grocery shopping.
- High ambient kitchen environments: requires ultra-clean contrast, fast scanning, big touch targets, and resilient Light/Dark visual modes.

## Capabilities and Constraints

1. **Intake & Scanning:** On-device OCR receipt parsing (Tesseract.js), camera barcode scanning with Open Food Facts integration, and rapid manual intake.
2. **Freshness & Urgency Triage:** Categorical shelf-life models (fridge, freezer, pantry) calculating real-time hours remaining; automated "Use This First" smart shelf prioritizing items expiring within 24–48 hours.
3. **"Before You Buy" Assistant:** Real-time search cross-referencing shopping items against existing stock with duplicate warnings.
4. **Recipe Rescue:** Automated meal suggestion algorithm matching expiring ingredients with pantry staples and calculating macros.
5. **Domestic Savings Analytics:** Tracking domestic rupees saved (₹ avoided waste based on MoSPI food basket index), kg of food diverted, CO₂e avoided (UNEP Food Waste Index standard), and zero-waste streaks.
6. **Cost Ceiling:** ₹0 strictly enforced. Client-side processing and Supabase free tier only.

## Brand Commitments

- **Name:** Khabar Chakra (খাবার চক্র)
- **Tagline:** Smart Food Lifecycle & Domestic Zero Waste
- **Mascot / Icon:** Botanical smiling bowl with circular lifecycle arrows and fresh leaves.
- **Voice:** Warm, encouraging, pragmatic, empowering; never guilt-tripping or preachy.
- **Privacy:** Private by default (`auth.uid() = owner_id`). No public listings, geo-tracking, or public user rosters.

## Evidence on Hand

- Standardized Indian packaged food and grocery database (`src/domain/packagedFoodDatabase.ts`).
- Freshness and domestic waste scoring mathematical engines (`src/domain/freshness.ts`, `src/domain/impact.ts`).
- MoSPI (Ministry of Statistics and Programme Implementation) ₹80/kg food valuation baseline and UNEP 2.5 kg CO₂e per kg food avoided diversion factors.
- Verified SVG icon set with 78 branded icons (`src/components/ui/KhabarIcon.tsx`).

## Product Principles

1. **Effortless Clarity:** Inventory and freshness status must be understood in 2 seconds from across the room.
2. **Action Over Guilt:** Never tell a user they failed; immediately offer a 1-click recipe or preservation technique to rescue the food.
3. **Pristine Luxury & Utility:** Domestic software shouldn't look like dull accounting spreadsheets. A kitchen is a home sanctuary; the tool must feel tactile, calm, and elevated.
4. **Fluid Parity:** Mobile phones and large desktop displays must share the exact same refined aesthetic, typography, and hierarchy.

## Accessibility & Inclusion

- WCAG AAA contrast standard on core text (≥ 7:1) and AA on large accents (≥ 4.5:1).
- Trilingual support: English (`en`), Bengali (`bn`), and Hindi (`hi`).
- Full reduced-motion media query support (`prefers-reduced-motion`).
- Minimum 44×44px interactive tap targets for mobile usability.

