# PHASE 5 SPEC — Waste & Impact

> **Version 1.0** · Status: Final, ready for implementation · Governed by AGENTS.md v1.1, PRD v1.1 §5.11–5.12, TRD §3.5, BACKEND SCHEMA §9, DESIGN SYSTEM v1.1.
> **Goal:** Close the 4R loop (Scan → Track → Rescue → Recycle) with a practical municipal waste separation guide, local organic drop-off directory for the Asansol/West Bengal corridor, and an idempotent public & personal Impact Accounting Ledger.
> **Binding Invariants Enforced:**
> - **Cost:** ₹0 cost hard ceiling.
> - **Integrity & Honesty:** Impact formulas use verified open citation baselines or marked placeholders (`TODO(source): ...` per AGENTS.md §3.5).
> - **Idempotency:** Impact calculations are deterministic and idempotent (AGENTS.md §3.4).
> - **Art Direction:** "The Kitchen Almanac" — tabular ledger layouts, hairline rules, Nunito + Caveat annotations, 78-icon SVG sprite system, border-radius ≤ 4px, zero glassmorphism.

---

## 1. Scope & Modules
1. **Waste Taxonomy & Separation Guide (`/[locale]/waste`):**
   - Five-tier household waste taxonomy:
     1. Home Composting (fruit/veg peels, tea leaves, coffee grounds).
     2. Community Animal Feed / Gaushala (clean leftover grains, vegetable scraps, non-toxic peelings).
     3. Dry Recyclables (clean food cartons, tin cans, glass bottles, rigid plastics).
     4. Wet Municipal Waste (mixed cooked organic food unsuitable for feed/compost).
     5. Landfill Last Resort (contaminated single-use plastics, multi-layer foil laminates).
   - Local Asansol & West Bengal Drop-off & Composting Directory:
     - Curated collection centres, municipal green bins, and verified community composting pits.
   - Interactive Waste Classifier: Quick search helper matching food type to the correct bin.

2. **Impact Accounting Ledger (`/[locale]/impact`):**
   - Personal & Community Impact metrics:
     - Kilograms of Food Diverted from Landfill (`kgDiverted`).
     - Meals Saved (1 meal = 0.42 kg standard benchmark).
     - CO₂e Avoided (kg CO₂e = kgDiverted × 2.5 kg CO₂e/kg baseline `TODO(source): UNEP Food Waste Index Report`).
     - Rupee Value Saved (Estimated at ₹80/kg average grocery/meal cost `TODO(source): NSSO/Consumer price placeholder`).
     - Water Consumed in Food Lifecycle Preserved (litres = kgDiverted × 450 L/kg average water footprint).
   - Annual Report Print/Export format (Almanac Folio style).
   - Milestone badges (e.g. "10kg Rescued", "First Feast Diverted").

---

## 2. Acceptance Criteria
- **AC-WASTE-01:** The waste guide details the 5 separate disposal streams with clear sorting rules and local drop-off points.
- **AC-WASTE-02:** The interactive waste search correctly categorizes produce scraps as compost and clean food packaging as dry recyclables.
- **AC-IMPACT-01:** Impact calculator accurately and idempotently computes kg diverted, CO₂e avoided, rupee value saved, and meals preserved.
- **AC-IMPACT-02:** Impact dashboard displays marked citations/placeholders for all emission and monetary coefficients.
