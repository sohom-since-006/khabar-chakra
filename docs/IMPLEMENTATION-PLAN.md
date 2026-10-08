# Implementation Plan — Khabar Chakra (Phases 1–6)

> Generated under MASTER PROMPT.md Step 0 Protocol.

---

## 1. Architecture & Execution Strategy
We execute the build sequentially from Phase 1 to Phase 6 in an autonomous, end-to-end manner. Every phase follows the strict test-first quality gate cycle:
1. Feature & Phase Specification (`docs/phase-N/PHASE-N-SPEC.md`).
2. Schema & RLS Migrations with allow/deny security tests.
3. Pure TypeScript Domain Logic with golden vectors.
4. Route handlers and Server Actions with input validation and rate limiting.
5. Distinctive "Kitchen Almanac" Art-Directed User Interfaces.
6. Verification via TypeScript, ESLint, Playwright, axe accessibility, and Lighthouse.

---

## 2. Dependency Order & Phases

### Phase 1: Foundation (Current)
- Design system: "The Kitchen Almanac" theme tokens, typography, hairline rules, zero glassmorphism.
- Landing page: Magazine cover layout, masthead typography, 3D still-life with capability tiers.
- Auth & Account Lifecycle: 18+ gate, Turnstile check, verified email gate, sessions refreshed via `src/proxy.ts`.
- Public Pages: Help Centre, searchable FAQ, contact letterform, colophon Team page ("Made by The S-QUAD"), legal drafts.
- Profile & Settings: Preferences sheet, theme toggles, Reduce-motion toggle, account deletion shell.

### Phase 2: Scan & Track
- Web Worker pipelines for client-side camera/gallery capture, barcode scanning, OCR, and classifier.
- Mandatory editable label confirmation sheet with confidence metrics.
- Freshness scoring & band engine (`green`, `amber`, `red`, `expired`).
- Inventory ruled ledger, "Use This First" shelf, Before You Buy scanner.
- Strict database constraints locking `meat_fish_egg` from sharing.

### Phase 3: Alerts, Recipes, Nutrition
- Supabase Realtime in-app notification pipeline.
- Internal cron jobs via Next.js route handlers (`/api/internal/jobs/*`).
- Recipe Rescue engine with allergen exclusions and multilingual alias matching.
- Nutrition journal and macro planner with nutrition-label table layout.

### Phase 4: Share & Community
- Listings with required 1–4 photos, static pins, hard 48h database window ceiling.
- Interactive Leaflet map (Asansol centered) with classifieds list rail and mobile snap-point drawer.
- Contact reveal RPC (`reveal_contact`) with audit logging and rate limiting.
- 6-digit perforated pickup ticket verification.
- Utilitarian monochrome Admin area with TOTP step-up, case claiming, and ≤60s document links.

### Phase 5: Waste & Impact
- Five-card waste category guide and drop-off map.
- Idempotent mathematical impact ledger and annual report dashboard.

### Phase 6: Polish & Launch
- Bengali and Hindi localization with localized typography and cursive accents.
- PWA manifest, service worker, and offline shell.
- Production hardening, runbook, and final quality audit.

---

## 3. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Docker unavailable on host machine | Run migrations and tests against the active remote Supabase cloud project or generate offline sql test runners. |
| AI-generated visual clichés | Enforce "Kitchen Almanac" design lint (`scripts/design-lint.mjs`), hairline rules, no glassmorphism, no gradient blobs. |
| Leaking PII / contacts | Contact points revealed strictly via database RPC with RLS and user session verification; never stored in client state. |
| Performance on low-end devices | Tier-based 3D scene (T2/T1/T0) with FPS watchdog and data-saver mode. |
