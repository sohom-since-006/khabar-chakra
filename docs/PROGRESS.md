# Master Progress Tracker (Phases 1–6)

> Single continuous run tracker. Updated after each task.

---

## Overall Status
- **Current Phase:** Phase 3 (Alerts, Recipes, Nutrition)
- **Active Task:** T3.0 Specification & Planning

---

## Phase 1: Foundation
- [x] **T1.0 Prerequisites & Repo Init**: Git initialized, Node v24 confirmed, package dependencies installed.
- [x] **T1.1 Core Documents & Decisions**: `docs/DECISIONS.md`, `docs/PROGRESS.md`, `docs/IMPLEMENTATION-PLAN.md` created.
- [x] **T1.2 Next.js 16 Bootstrap**: App Router, Turbopack, Tailwind CSS v4, `src/proxy.ts` session management.
- [x] **T1.3 Supabase Integration**: Server/browser/proxy clients configured, `.env.local` created, `.env.example` committed.
- [x] **T1.4 Design System & "Kitchen Almanac" Tokens**: Semantic colors (Basil, Mango, Chilli, Blueberry), typographic scale, hairline rules, zero glassmorphism, 78-icon SVG sprite system.
- [x] **T1.5 Landing Page**: Magazine cover composition, masthead, contents index, single 3D still-life with capability tiers (T2/T1/T0) and FPS watchdog.
- [x] **T1.6 Auth Flow**: Sign up (18+ gate, terms gate), Login/Logout, Email verification with 60s cooldown, Password reset and recovery dispatch, Auth callback route.
- [x] **T1.7 Core Content Pages**: Team colophon (D13), Help Centre (7 sections), searchable FAQ (12 items + anchor links), Contact form (Form 102 to admin inbox), Draft legal pages (terms, privacy, food-safety, guidelines).
- [x] **T1.8 User Profile & Settings**: First-run Welcome passport, Preferences, theme switcher, Reduce animations, account deletion shell, security page.
- [x] **T1.9 Quality Gates**: Typecheck (PASS), ESLint (PASS), Design linter (PASS), Vitest (PASS 9/9), Next.js 16 Turbopack build (PASS).

---

## Phase 2: Scan & Track
- [x] **T2.0 Spec**: `docs/phase-2/PHASE-2-SPEC.md` written and validated.
- [x] **T2.1 Domain Logic & Invariants**: Pure TypeScript `src/domain/` modules (`freshness.ts`, `wasteRisk.ts`, `shelfLife.ts`, `fssai.ts`) with half-up rounding, D8 Meat/Fish/Egg sharing ban lock, and 18 passing Vitest unit tests.
- [x] **T2.2 Barcode & Open Food Facts**: Free zero-cost integration (`src/lib/openFoodFacts.ts`) with dietary mapping.
- [x] **T2.3 Add Food Ingestion Flow**: Mode switcher (manual, barcode, camera viewfinder with EXIF wipe), FSSAI 14-digit validator, shelf-life auto-estimation, and editable confirmation proof sheet (`/[locale]/inventory/add`).
- [x] **T2.4 "Before You Buy" Assistant**: Real-time grocery duplicate checker (`/[locale]/inventory/check`).
- [x] **T2.5 Kitchen Ledger UI**: Active pantry dashboard with prominent "Use This First" priority shelf, ruled ledger table, card view, category/band filters, and Action Ladder outcome tracking modal (`/[locale]/home` and `/[locale]/inventory`).

---

## Phase 3: Alerts, Recipes, Nutrition
- [ ] **T3.0 Spec**: Write `docs/phase-3/PHASE-3-SPEC.md`.
- [ ] **T3.1 Database & Jobs**: Notifications, internal cron job routes, SQL jobs.
- [ ] **T3.2 Realtime & Push**: In-app notifications with Realtime, web push fallback.
- [ ] **T3.3 Recipe Rescue**: Diet/allergy filters, cookbook layout, alias matcher.
- [ ] **T3.4 Nutrition Journal**: Data journal, TDEE/macros, nutrition label layout.

---

## Phase 4: Share & Community
- [ ] **T4.0 Spec**: Write `docs/phase-4/PHASE-4-SPEC.md`.
- [ ] **T4.1 Listings & Moderation**: 1–4 photos, static pin, ≤ 48h window, meat/fish/egg hard lock.
- [ ] **T4.2 Available Food & Interactive Map**: Leaflet + OSM, classifieds rail, filters, mobile bottom sheet.
- [ ] **T4.3 Handover & Contact Reveal**: `reveal_contact()` RPC with audit/quotas, 6-digit perforated pickup code.
- [ ] **T4.4 Organisation Verification & Admin Area**: Document vault (≤60s links), case claiming, two-admin approval rule, utilitarian monochrome admin UI.

---

## Phase 5: Waste & Impact
- [ ] **T5.0 Spec**: Write `docs/phase-5/PHASE-5-SPEC.md`.
- [ ] **T5.1 Waste Guide**: Five-card waste taxonomy, drop-off directory.
- [ ] **T5.2 Impact Ledger**: Idempotent formula-based impact accounting, annual report layout.

---

## Phase 6: Polish & Launch
- [ ] **T6.0 Spec**: Write `docs/phase-6/PHASE-6-SPEC.md`.
- [ ] **T6.1 Internationalisation**: Bengali (`bn`) and Hindi (`hi`) translation keys and fonts.
- [ ] **T6.2 PWA & Offline Support**: Service worker, offline shell, read-only cache.
- [ ] **T6.3 Final Quality Gates & Runbook**: Performance budgets, security checklist, deployment guide.
