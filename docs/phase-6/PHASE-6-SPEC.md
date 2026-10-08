# PHASE 6 SPEC — Polish & Launch

> **Version 1.0** · Status: Final, ready for implementation · Governed by AGENTS.md v1.1, PRD v1.1 §5.13–5.15, TRD §4 & §7, DESIGN SYSTEM v1.1.
> **Goal:** Complete the production-ready polish and launch gates: multi-language message dictionaries (English, Bengali `bn`, Hindi `hi`), PWA manifest and offline service worker, accessibility and keyboard focus compliance, and final end-to-end audit.
> **Binding Invariants Enforced:**
> - **D14:** English first; Bengali and Hindi message dictionaries complete; plan for +40% text expansion.
> - **D18:** Hindi removed from logo; appears only as UI text (খাবার চক্র / खाना चक्र).
> - **A11y:** Focus rings from tokens, contrast ≥ 4.5:1 for body and ≥ 3:1 for large/badges, touch targets ≥ 44 px, no colour-only meaning.
> - **PWA:** Installable web app manifest with standalone display, icons, and theme color `#0B6E3C`.
> - **Performance:** Respect performance budgets; clean static asset caching.

---

## 1. Scope & Modules
1. **Internationalisation (i18n) Architecture & Dictionaries:**
   - Locale message catalog for English (`en`), Bengali (`bn`), and Hindi (`hi`) in `src/messages/`.
   - Locale switcher in navigation / footer allowing seamless language toggling.
   - Translation keys covering common headers, action ladder, food safety disclaimers, and status badges.
2. **Progressive Web App (PWA) & Offline Shell:**
   - Web App Manifest (`src/app/manifest.ts` / `public/manifest.json`) specifying name, short name, theme color (`#0B6E3C`), background color (`#FAFDF6`), and icons.
   - Lightweight service worker (`public/sw.js`) for static asset caching and offline fallback notification.
3. **Accessibility (A11y) & Visual Polish:**
   - Keyboard focus rings using `var(--kc-basil-800)` / `var(--kc-basil)`.
   - ARIA live announcements for status updates, tooltips, and modals.
   - Contrast check: verifies light and dark modes against WCAG AA standards.
4. **Final System Verification:**
   - Typecheck, ESLint, Design Linter, Vitest test suite, and Turbopack production build.

---

## 2. Acceptance Criteria
- **AC-I18N-01:** Message dictionaries exist for `en`, `bn`, and `hi`, including all key disclaimers and core terminology.
- **AC-PWA-01:** Web App Manifest is served with valid JSON structure, matching icons, and `#0B6E3C` theme color.
- **AC-A11Y-01:** Interactive elements maintain minimum 44px touch targets and clear visible focus outlines.
