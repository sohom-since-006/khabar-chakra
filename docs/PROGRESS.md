# Master Progress Tracker (Phases 1–6)

> Single continuous run tracker. Updated after each task.

---

## Overall Status
- **Current Phase:** Phase 1 (Foundation)
- **Active Task:** Step 0 Preparation & Phase 1 Core Implementation

---

## Phase 1: Foundation
- [x] **T1.0 Prerequisites & Repo Init**: Git initialized, Node v24 confirmed, package dependencies installed.
- [x] **T1.1 Core Documents & Decisions**: `docs/DECISIONS.md`, `docs/PROGRESS.md`, `docs/IMPLEMENTATION-PLAN.md` created.
- [x] **T1.2 Next.js 16 Bootstrap**: App Router, Turbopack, Tailwind CSS v4, `src/proxy.ts` session management.
- [x] **T1.3 Supabase Integration**: Server/browser/proxy clients configured, `.env.local` created, `.env.example` committed.
- [ ] **T1.4 Design System & "Kitchen Almanac" Tokens**: Semantic colors (Basil, Mango, Chilli, Blueberry), typographic scale, hairline rules, zero glassmorphism.
- [ ] **T1.5 Landing Page**: Magazine cover composition, masthead, contents index, single 3D still-life with capability tiers.
- [ ] **T1.6 Auth Flow**: Sign up (18+ gate, Turnstile), Login/Logout, Email verification, Password reset.
- [ ] **T1.7 Core Content Pages**: Team colophon, Help Centre, searchable FAQ, Contact form (admin inbox), Draft legal pages.
- [ ] **T1.8 User Profile & Settings**: Preferences, theme switcher, Reduce animations, account deletion shell.
- [ ] **T1.9 Quality Gates**: Typecheck, lint, build, axe a11y, visual QA at 360/768/1280px.

---

## Phase 2: Scan & Track
- [ ] **T2.0 Spec**: Write `docs/phase-2/PHASE-2-SPEC.md`.
- [ ] **T2.1 Database Migrations**: `inventory_items`, bands, constraints, RLS policies.
- [ ] **T2.2 Domain Logic**: Freshness scoring, bands, waste risk calculation with unit tests.
- [ ] **T2.3 Add Food Viewfinder**: Camera/gallery capture, Web Worker OCR/barcode/classifier, editable confirmation proof sheet.
- [ ] **T2.4 Inventory UI**: Ruled ledger table / mobile list, "Use This First" shelf, filters and density switches.

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
