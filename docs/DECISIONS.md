# Architecture & Project Decisions Record (ADR / Decisions Log)

> Extends binding decisions D1–D24 from AGENTS.md with MASTER PROMPT.md overrides D25–D36.

---

## Binding Decisions & Overrides

### D25 — Per-request dynamic rendering
All pages are rendered per request. No static/ISR HTML caching for user-visible application state.

### D26 — Identity checks on server
Identity checks use `getClaims()`; sensitive operations also use `getUser()`; never `getSession()` on the server.

### D27 — Supabase key naming
Key naming adheres to Supabase current standards: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (client/browser) and `SUPABASE_SERVICE_ROLE_KEY` / secret key (server-only). Backwards compatibility alias for `NEXT_PUBLIC_SUPABASE_ANON_KEY` is maintained.

### D28 — Clock & testing
`app_now()` defaults to plain `now()`; tests redefine time inside their own rolled-back transactions or injected parameters.

### D29 — Security headers & CSP
Baseline enforced CSP plus nonce-based CSP; tightened to nonce-only before production launch.

### D30 — Locales
`locales: ['en']` for Phases 1–5; Bengali (`bn`) and Hindi (`hi`) added in Phase 6.

### D31 — Art Direction "The Kitchen Almanac"
Supersedes generic SaaS/AI aesthetics in DESIGN SYSTEM.md:
- No glassmorphism, no backdrop blur.
- No floating blobs or glowing effects.
- Minimal shadows.
- Border radius ≤ 4px (larger only for avatars and switches).
- Hairline rules, numbered chapters, margin column for cursive annotations.
- Marker highlight (Mango) and urgent stamps (Chilli).

### D32 — Typography
Self-hosted distinctive fonts by role: editorial display face, clean readable body text, tabular figures for tables/stats, and one cursive handwriting font for margin notes and annotations.

### D33 — Landing 3D Still-Life
Single art-directed 3D food object (product photography style) on landing page with scroll responsiveness; capability detection (T2 / T1 / T0) with FPS watchdog and data-saver respect.

### D34 — Multi-Page Architecture
Every major page type has its own distinct editorial composition, not a single continuous scrolling page.

### D35 — Precedence
D1–D24 remain binding except typography from D24.

### D36 — Zero-cost and graceful degradation
Optional keys remain blank; every external service degrades gracefully without crashes.

---

## Operational Decisions & Environment
- **Node & NPM:** Node v24.12.0 and npm 11.6.2 active.
- **Next.js 16:** Using `src/proxy.ts` for request interception and session upkeep (deprecating `middleware.ts`).
- **Database Target:** Remote Supabase instance configured at `https://traxfemzrvxirtlcxpov.supabase.co`.
