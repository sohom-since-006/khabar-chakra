# Design System — Khabar Chakra (খাবার চক্র) v2.0

<!-- impeccable:design-schema 1 -->

## Visual World: Emerald Sanctuary & Culinary Atelier

Khabar Chakra v2.0 combines the calm, tactile serenity of a sunlit domestic kitchen atelier with the razor-sharp precision of high-end modern glassmorphism. It is built for seamless continuity across smartphones, tablets, and wide desktop screens.

### Design Principles

1. **Atelier Elegance:** Clean porcelain whites, deep obsidian velvets, and living botanical emeralds. No flat, sterile accounting aesthetics.
2. **Unified Typographic Parity:** Desktop and mobile viewports share the exact same font pairing, typographic weight hierarchy, and proportional leading.
3. **Glass & Light Surface Elevation:** Translucent layered surfaces, subtle micro-hairlines (`border-black/[0.06]` and `border-white/[0.08]`), and ambient basil glows create depth without visual noise.
4. **Honest Freshness Signals:** Color is always paired with clear text and iconography. Urgency is presented with calm utility and actionable recipe solutions, never red warning alarms or guilt.

---

## Typography Ramp (Unified Across Mobile & PC)

The typographic system uses **Plus Jakarta Sans / Outfit** for all structural elements, navigation, interactive controls, and body text, paired with **Playfair Display** for prestige culinary titles and **Sacramento** for subtle cursive handwritten chef annotations.

| Role | Font Family | Mobile Size / Leading | Desktop Size / Leading | Weight | Tracking |
|---|---|---|---|---|---|
| **Display Title** | Playfair Display / Outfit | 32px / 1.15 | 48–56px / 1.1 | 700–800 | -0.02em |
| **H1 Headline** | Outfit / Jakarta Sans | 26px / 1.2 | 36px / 1.15 | 700 | -0.015em |
| **H2 Section** | Outfit / Jakarta Sans | 20px / 1.25 | 26px / 1.2 | 700 | -0.01em |
| **H3 Card Title** | Outfit / Jakarta Sans | 16px / 1.3 | 18px / 1.3 | 600 | 0 |
| **Body (Primary)** | Outfit / Jakarta Sans | 15px / 1.6 | 16px / 1.65 | 400–500 | 0 |
| **Body Small** | Outfit / Jakarta Sans | 13px / 1.5 | 13.5px / 1.5 | 400–500 | +0.005em |
| **Micro Caption** | Outfit / Jakarta Sans | 11px / 1.4 | 11.5px / 1.4 | 600 | +0.03em |
| **Chef Annotation** | Sacramento / Cursive | 24px / 1.1 | 30px / 1.1 | 400 (Regular) | 0 |
| **Monospace / Metric** | System Mono / Tabular | 13px / 1.4 | 14px / 1.4 | 600 | tabular-nums |

---

## Color Tokens & Spatial Roles

### Light Mode — Sunlit Kitchen Porcelain
- **Canvas (`--kc-bg`):** `#F8FAF8` (Clean alabaster porcelain)
- **Elevated Card (`--kc-card`):** `#FFFFFF` with `backdrop-blur-md`
- **Card Border (`--kc-card-border`):** `rgba(10, 40, 30, 0.08)`
- **Primary Ink (`--kc-ink`):** `#082117` (Deep botanical charcoal)
- **Secondary Muted (`--kc-muted`):** `#48685C` (Soft kitchen sage)
- **Primary Accent (`--kc-basil`):** `#0B6E3C` (Living fresh basil green)
- **Primary Hover (`--kc-basil-hover`):** `#08552E`
- **Gold Accent (`--kc-mango`):** `#D97706` (Warm culinary honey)
- **Urgent / Expiring (`--kc-chilli`):** `#DC2626` (Warm paprika red)
- **Information (`--kc-blueberry`):** `#2563EB` (Cobalt blue)
- **Fresh Wash (`--kc-mint`):** `#EDF7F1` (Mint wash)

### Dark Mode — Obsidian Botanical Velvet
- **Canvas (`--kc-bg`):** `#07150F` (Obsidian green velvet)
- **Elevated Card (`--kc-card`):** `#0D231A` (Deep emerald night)
- **Card Border (`--kc-card-border`):** `rgba(255, 255, 255, 0.09)`
- **Primary Ink (`--kc-ink`):** `#F3FAF6` (Luminous porcelain)
- **Secondary Muted (`--kc-muted`):** `#95B5A7` (Silvery sage)
- **Primary Accent (`--kc-basil`):** `#10B981` (Vibrant emerald glow)
- **Primary Hover (`--kc-basil-hover`):** `#059669`
- **Gold Accent (`--kc-mango`):** `#F59E0B` (Champagne honey gold)
- **Urgent / Expiring (`--kc-chilli`):** `#EF4444` (Glowing coral red)
- **Information (`--kc-blueberry`):** `#3B82F6` (Electric azure)
- **Fresh Wash (`--kc-mint`):** `#122E22` (Emerald shadow wash)

---

## Component Standards

1. **Cards:** `rounded-3xl` with multi-tier drop-shadows and micro-borders (`border border-[var(--kc-card-border)]`). No heavy `border-l-4` side-tabs.
2. **Buttons:** Pill-shaped or `rounded-2xl`, with smooth micro-interaction hover transforms (`translate-y-[-1px]` with cubic deceleration, active `scale-[0.985]`).
3. **Pills & Badges:** Compact glass capsules with circular status indicator lights (🟢 🟡 🔴).
4. **Header:** Frosted glass navbar with backdrop blur (`backdrop-blur-xl bg-white/80 dark:bg-[#071610]/85`), delicate border divider, and responsive pill links.
5. **Mobile Navigation:** Floating glass dock at the bottom of the viewport with haptic icons and active ambient pill indicators.
