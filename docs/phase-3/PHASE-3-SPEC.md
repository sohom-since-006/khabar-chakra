# PHASE 3 SPEC — Alerts, Recipes, Nutrition

> **Version 1.0** · Status: Final, ready for implementation · Depends on PRD v1.1 §5.4 & §5.6, TRD §3 & §5, BACKEND SCHEMA §7 & §13, DESIGN SYSTEM v1.1, AGENTS v1.1.
> **Goal:** Build the proactive food conservation loop: automated freshness alerts, Recipe Rescue matching engine (prioritising near-expiry ingredients with Bengali/Indian culinary roots), and nutrition planning with dietary filters.
> **Binding Invariants Enforced:**
> - ₹0 cost ceiling (local recipe database, zero paid AI recipe APIs).
> - Recipient decides / Health advice disclaimer ("General guidance only; consult medical professional for conditions").
> - Hard dietary and allergy filters (strict Veg / Vegan / Non-Veg / Egg separation).
> - "The Kitchen Almanac" art direction (cookbook typography, recipe card indices, Nunito + Caveat annotations, 78-icon SVG sprite).

---

## 1. Scope
**In:**
- Freshness Alerts & Dispatch Engine:
  - In-app freshness notification feed (`/[locale]/notifications` and navbar bell badge).
  - Internal job route `/api/internal/jobs/freshness` (protected by secret header, evaluates active inventory deadlines and generates notification records).
- Recipe Rescue Engine:
  - Catalog of authentic Indian and Bengali home recipes (`src/data/recipes.ts`).
  - Rescue scoring algorithm: Ranks recipes by the proportion of near-expiry ingredients matched from current pantry inventory.
  - Interactive recipe index (`/[locale]/recipes`) and recipe detail sheet (`/[locale]/recipes/[slug]`).
  - Hard dietary filters (Veg, Vegan, Egg, Non-Veg) and allergen exclusion.
  - "I Cooked This" one-tap deduction deducting ingredients from the active kitchen ledger.
- Nutrition Journal & Planner (`/[locale]/nutrition`):
  - Caloric and macronutrient estimator (TDEE, protein, carbs, fats).
  - Meal suggestions utilizing ingredients already present in the home pantry.
  - Prominent statutory medical disclaimer.

---

## 2. Acceptance Criteria
- **AC-RECIPE-01:** Recipe Rescue calculates a match score based on ingredients in the user's kitchen in the `expiring` or `consume_soon` bands.
- **AC-RECIPE-02:** Strict dietary filters exclude non-matching recipes (e.g., Selecting "Pure Veg" strictly eliminates meat/fish/egg recipes).
- **AC-RECIPE-03:** Clicking "I Cooked This" prompts confirmation and updates inventory items to `closed` with outcome `cooked`.
- **AC-ALERT-01:** Items with less than 24h remaining generate urgent in-app freshness notification items.
- **AC-NUT-01:** The nutrition planner shows daily targets and explicitly displays the non-medical general guidance disclosure.
