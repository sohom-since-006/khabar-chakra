# CODE_STYLE — Khabar Chakra (খাবার চক্র)

> **Version 1.1** · Status: **Final, usable directly** · Supersedes v1.0.
> Depends on ARCHITECTURE v1.1, TRD v1.1, BACKEND SCHEMA v1.1, DESIGN SYSTEM v1.1, SECURITY v1.1, TESTING v1.1, AGENTS v1.1, PHASE-1 BUILD KIT.
> **Audience:** every contributor, human or AI. Code must be readable by a second-year student.
> **Precedence:** AGENTS.md §2–3 and SECURITY.md override this file. Tools enforce what they can; this file explains the rest.
> **Verified facts used here (Oct 2026):** Next.js 16 line (`proxy.ts`, async `params` and `cookies()`, no `next lint`), Node ≥ 20.9; Supabase SSR uses the publishable key and `getClaims()`; Tailwind v4 is CSS-first. Where a snippet and the installed library docs disagree, the docs win.

## 0. What changed since v1.0
`getClaims()` for identity (D26) · `proxy.ts`, async params · ESLint CLI (no `next lint`) · token utility names (`bg-page`, `text-ink`, `bg-highlight`…) · `motion/react` (VERIFY package name) · all examples are complete and typed · added Server Action, form, hook, logger, origin-check, SQL, pgTAP, Vitest and Playwright examples.

## 1. Principles
| # | Principle | Meaning |
|---|-----------|---------|
| C1 | Boring beats clever | Prefer the obvious, well-known solution. |
| C2 | Readable top to bottom | Small functions, early returns, shallow nesting. |
| C3 | Safe by construction | Types, shared Zod schemas and database rules make wrong code hard to write. |
| C4 | One way to do each thing | One date library, one form library, one error type, one fetch pattern. |
| C5 | Pure core, thin edges | Business rules live in `src/domain`; routes and components only wire things together. |
| C6 | Accessible and translatable by default | Semantic HTML, keyboard support, no hard-coded text. |
| C7 | Tests are part of the code | No test or doc update means unfinished. |
| C8 | Consistency over taste | Follow this file and the formatter. |

## 2. Tooling and Enforcement
| Tool | Purpose | Runs |
|------|---------|------|
| TypeScript `strict` | Type safety | editor, `npm run typecheck`, CI |
| ESLint (flat config, CLI) | Bugs, a11y, security, boundaries, i18n | editor, pre-commit, CI |
| Prettier + Tailwind class sorter | Formatting | save, pre-commit, CI |
| Husky + lint-staged + gitleaks | Pre-commit checks and secret scan | commit |
| commitlint | Conventional Commits | commit-msg |
| Dependabot + `npm audit` | Dependency health (patch security releases within 48 h) | CI |

### 2.1 `tsconfig.json` (merge into the generated file)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### 2.2 `.prettierrc`
```json
{ "singleQuote": true, "semi": true, "trailingComma": "all", "printWidth": 100, "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"] }
```

### 2.3 `eslint.config.mjs` (extend the generated flat config; VERIFY import names against the generated file)
```js
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Modules allowed to use the service-role/secret Supabase client (SECURITY §6.3).
const SERVICE_ROLE_ALLOWED = [
  'src/lib/supabase/admin.ts',
  'src/lib/uploads/confirm.ts',
  'src/lib/uploads/signed-urls.ts',
  'src/lib/audit.ts',
  'src/app/api/contact/route.ts',
  'src/app/api/internal/jobs/**',
  'src/app/api/admin/session-start/route.ts',
];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'src/types/database.ts']),
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error', // needs type-aware linting; enable parserOptions.projectService
      'react/no-danger': 'error', // dangerouslySetInnerHTML only in the sanitised-Markdown component
      'no-restricted-imports': ['error', {
        paths: [{ name: '@/lib/supabase/admin', message: 'Secret-key client: approved modules only (SECURITY §6.3).' }],
      }],
    },
  },
  {
    // Approved modules may import the secret-key client.
    files: SERVICE_ROLE_ALLOWED,
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // The sanitised-Markdown component is the only place allowed to render raw HTML.
    files: ['src/components/safe-markdown.tsx'],
    rules: { 'react/no-danger': 'off' },
  },
  {
    // Tests may use non-null assertions and console.
    files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off', 'no-console': 'off' },
  },
]);
```
Also add (follow each plugin's current docs): `eslint-plugin-boundaries` to enforce ARCHITECTURE §4.2 (domain imports nothing; `components` never import `features`; features talk through their `index.ts`), and an i18n rule that fails on hard-coded JSX text (for example `eslint-plugin-i18next` `no-literal-string`). Scripts: `"lint": "eslint ."` (there is no `next lint` in Next.js 16).

### 2.4 Vitest `vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/component/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    coverage: { provider: 'v8', include: ['src/domain/**'], thresholds: { lines: 95, branches: 90 } },
  },
});
```
`tests/setup.ts`: `import '@testing-library/jest-dom/vitest';`

## 3. Naming
| Thing | Convention | Example |
|-------|-----------|---------|
| Files, folders | `kebab-case` | `listing-card.tsx`, `use-countdown.ts` |
| Components | `PascalCase`, named export | `ListingCard` |
| Hooks | `useCamelCase` | `useAvailableListings` |
| Functions, variables | `camelCase`; verbs for functions | `computeFreshness`, `isListingLive` |
| Booleans | `is/has/can/should` prefix | `isVerified` |
| Types | `PascalCase`, no `I` prefix | `ListingFilters` |
| True constants | `UPPER_SNAKE_CASE` | `MAX_LISTING_PHOTOS` |
| Zod schemas | `xSchema`, type `X` | `createListingSchema` → `CreateListingInput` |
| Handlers | `handleX` inside, `onX` as props | `handleSubmit`, `onClose` |
| Tests | `*.test.ts(x)` | `freshness.test.ts` |
| Test IDs in DOM | kebab-case `data-testid` | `faq-trigger` |
| i18n keys | `feature.section.key` | `listings.card.endsIn` |
| CSS variables | `--kc-*` (tokens), semantic utilities in components | `--kc-text-muted`, `text-ink-muted` |
| DB objects | `snake_case`, plural tables; `rpc_*` callable, `fn_*` helper, `job_*` scheduled, `trg_*` trigger | `listing_requests` |
| Env vars | `UPPER_SNAKE`; `NEXT_PUBLIC_` only for public values | `NEXT_PUBLIC_SITE_URL` |
Names describe meaning, not type (`expiresAt`, not `date2`).

## 4. Structure and Size
- Follow ARCHITECTURE §4–5. Feature slices expose a public `index.ts`; nothing deep-imports another feature.
- Guidelines (justify exceptions in review): file ≤ 400 lines, component ≤ 250, function ≤ 40, ≤ 4 parameters (then use an object), nesting ≤ 3.
- Barrel files only at feature roots. No `utils.ts` dumping grounds — name modules for what they do (`format-inr.ts`).
- Thresholds and magic numbers live in named constants or config tables (for example `domain/listings/limits.ts`).
```
src/features/listings/
  components/   listing-card.tsx  listing-wizard.tsx
  hooks/        use-countdown.ts
  queries/      use-listings-in-view.ts
  actions/      publish-listing.ts        # server actions
  schemas.ts                              # Zod schemas shared by client and server
  types.ts
  index.ts                                # the only public entry point
```

## 5. TypeScript Rules
1. **No `any`.** Use `unknown` and narrow with Zod or type guards.
2. **No non-null assertions** in app code (allowed in tests).
3. Prefer union types over enums. Database enums come from generated types (`src/types/database.ts`), never hand-copied.
4. `type` for shapes and unions; `interface` only for extendable contracts.
5. Explicit return types on exported functions.
6. `readonly` and `as const` for fixed data; do not mutate inputs.
7. Expected failures return a result object; unexpected failures throw `AppError`.
8. Exhaustive `switch` with a `never` check.
9. No default exports except framework files (`page`, `layout`, `route`, …).
10. Every promise is awaited, returned or deliberately handled.
11. Dates: store ISO UTC strings; compute with `date-fns` (+ `date-fns-tz`); display with `Intl` in the user's zone (default `Asia/Kolkata`). Time comes from an injected clock, never scattered `Date.now()` in domain code.
12. Money and quantities: one `formatInr` helper; quantities carry a unit and a normalised base value.
13. Derive types from schemas.

```ts
// src/lib/result.ts
export type Result<T, E extends string = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E extends string>(error: E): Result<never, E> => ({ ok: false, error });

export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${String(x)}`);
}
```
```ts
// src/features/listings/schemas.ts
import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().max(1000).optional(),
  category: z.enum(['packaged', 'vegetables', 'fruits', 'dairy', 'grains_pulses', 'bread_bakery', 'cooked_food', 'beverages', 'other']), // meat_fish_egg is intentionally absent (D8)
  dietType: z.enum(['veg', 'non_veg', 'egg', 'vegan']), // the donor must choose; never default
  qtyValue: z.coerce.number().positive().max(100000),
  availableUntil: z.string().datetime(),
});
export type CreateListingInput = z.infer<typeof createListingSchema>;
```
```ts
// Exhaustive switch
import { assertNever } from '@/lib/result';
import type { Band } from '@/domain/freshness';

export function bandLabelKey(band: Band): string {
  switch (band) {
    case 'green': return 'status.fresh';
    case 'amber': return 'status.soon';
    case 'red': return 'status.expiring';
    case 'expired': return 'status.expired';
    default: return assertNever(band);
  }
}
```

## 6. React and Next.js Rules
1. **Server Components by default.** Add `'use client'` only at the leaf that needs state, effects or browser APIs.
2. Pages are **dynamic** (D25). `params` and `searchParams` are Promises: always `await` them.
3. Server data: server client in server components; **TanStack Query** in client islands. Do not fetch in `useEffect` when a server component or query hook works.
4. Modules touching secrets start with `import 'server-only'`.
5. Components are small and typed; logic lives in `domain/` or hooks. Props ≤ ~6; avoid prop drilling beyond two levels.
6. Hooks: top level only; clean up timers, listeners, Realtime channels and workers.
7. Effects only synchronise with external systems; derive values during render.
8. Memoise only after measuring.
9. Segments that fetch data have `loading.tsx` and `error.tsx`; unknown things call `notFound()`.
10. Use `next/image`, the `next-intl` navigation helpers and the Metadata API. Never hard-code locale paths.
11. Forms: React Hook Form (or `useActionState`) with the shared Zod schema; errors beside fields with `aria-describedby`.
12. Heavy modules (map, 3D, OCR/classifier workers, charts) are dynamic imports.
13. Never read `window`, `document` or `navigator` during render.
14. Admin code stays in `app/[locale]/admin` and `features/admin`, English-only, and ends in `notFound()` on a failed server check.

**Server page (Next.js 16, next-intl v4, dynamic)**
```tsx
// src/app/[locale]/(marketing)/faq/page.tsx
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { FaqAccordion } from '@/features/help';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  return { title: t('title'), description: t('description') };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from('faq_items')
    .select('id, slug, question_i18n, answer_i18n, faq_categories(slug, title_i18n)')
    .order('sort_order');
  if (error) throw error;
  return <FaqAccordion items={items ?? []} locale={locale} />;
}
```

**Client component**
```tsx
'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import type { ListingSummary } from '../types';
import { useCountdown } from '../hooks/use-countdown';

type ListingCardProps = Readonly<{ listing: ListingSummary; className?: string }>;

export function ListingCard({ listing, className }: ListingCardProps) {
  const t = useTranslations('listings.card');
  const minutesLeft = useCountdown(listing.availableUntil);

  return (
    <article className={cn('border-b border-line py-4', className)}>
      <h3 className="text-lg font-semibold text-ink">{listing.title}</h3>
      <p className="text-ink-muted">{t('feeds', { count: listing.servesPeople })}</p>
      {minutesLeft !== null && <p className="text-danger">{t('endsIn', { minutes: minutesLeft })}</p>}
    </article>
  );
}
```

**Hook with cleanup (no hydration mismatch)**
```ts
// src/features/listings/hooks/use-countdown.ts
'use client';

import { useEffect, useState } from 'react';

/** Whole minutes left until `endIso`, or null before mount / after the end. Updates every 30 s. */
export function useCountdown(endIso: string): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  const ms = new Date(endIso).getTime() - now;
  return ms > 0 ? Math.ceil(ms / 60_000) : null;
}
```

**Server Action with validation, rate limit and generic errors**
```ts
// src/features/auth/actions/login.ts
'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RULES } from '@/lib/rate-limit';
import { clientIp } from '@/lib/ip';
import { safeNext } from '@/lib/safe-next';
import { AppError } from '@/lib/errors';

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
  next: z.string().optional(),
});

export type LoginState =
  | { ok: true }
  | { ok: false; code: 'VALIDATION_FAILED' | 'INVALID_CREDENTIALS' | 'RATE_LIMITED'; retryAfter?: number };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, code: 'VALIDATION_FAILED' };

  try {
    await rateLimit(RULES.login, clientIp(await headers()));
  } catch (e) {
    if (e instanceof AppError && e.code === 'RATE_LIMITED') {
      return { ok: false, code: 'RATE_LIMITED', retryAfter: e.details?.retryAfter as number | undefined };
    }
    throw e;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  // One generic answer for every failure (never say whether the email exists).
  if (error) return { ok: false, code: 'INVALID_CREDENTIALS' };

  redirect({ href: safeNext(parsed.data.next, '/home'), locale: 'en' });
  return { ok: true }; // unreachable; satisfies the return type
}
```
**Form using the action**
```tsx
'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { loginAction, type LoginState } from '../actions/login';

const initial: LoginState = { ok: true };

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations('auth.login');
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="next" value={next ?? ''} />
      <label htmlFor="email">{t('email')}</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="password">{t('password')}</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
      {!state.ok && (
        <p role="alert" id="login-error">
          {state.code === 'RATE_LIMITED'
            ? t('locked', { minutes: Math.ceil((state.retryAfter ?? 60) / 60) })
            : t('error')}
        </p>
      )}
      <button type="submit" disabled={pending} aria-busy={pending}>{t('submit')}</button>
    </form>
  );
}
```

## 7. Styling (Tailwind v4 + tokens)
1. **Semantic utilities only** (`bg-page`, `bg-surface`, `text-ink`, `text-ink-muted`, `border-line`, `border-line-input`, `bg-primary text-on-primary`, `bg-highlight text-on-highlight`, `text-link`, `bg-danger text-on-danger`, `bg-info-bg text-info`, `ring-focus`, status utilities `bg-fresh-bg text-fresh-fg`). **No hex codes or raw palette classes** in components. Light/dark come from variables, so avoid `dark:` colour overrides.
2. Combine classes with `cn()`; variants with `cva`.
3. Mobile first from 360 px; logical properties (`ms-`, `me-`, `ps-`, `pe-`).
4. Inline `style` only for truly dynamic values.
5. No `!important`; no magic z-indexes (use the scale); no fixed heights on text.
6. Every interactive element keeps the global focus ring; touch targets ≥ 44 px.
7. Motion uses the shared motion hook, never `matchMedia` directly; every animation has a reduced version.
8. The cursive accent class is for short decorative text only.
9. Meaning is never colour alone: colour + icon + text.
```ts
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```
```tsx
// src/components/ui/action-button.tsx  (pattern; the visual design follows the current art direction)
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const actionButton = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 px-5 font-semibold transition-colors disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:bg-primary-hover',
        highlight: 'bg-highlight text-on-highlight hover:bg-highlight-hover',
        outline: 'border border-line-input text-ink hover:bg-sunken',
        danger: 'bg-danger text-on-danger',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof actionButton>;

export function ActionButton({ className, variant, ...props }: Props) {
  return <button className={cn(actionButton({ variant }), className)} {...props} />;
}
```
```ts
// src/lib/motion.ts — one shared source for motion level (OS setting, in-app toggle, FPS watchdog)
'use client';
import { useReducedMotion } from 'motion/react'; // VERIFY: package name `motion` vs `framer-motion`

export type MotionLevel = 'none' | 'reduced' | 'full';

export function useMotionLevel(userReduce: boolean, lowPerformance: boolean): MotionLevel {
  const osReduce = useReducedMotion();
  if (osReduce || userReduce) return 'none';
  return lowPerformance ? 'reduced' : 'full';
}
```

## 8. Internationalisation
1. **No hard-coded user-facing text** (lint-enforced). Use `useTranslations` / `getTranslations` with namespaced keys.
2. Messages live in `messages/en.json` (later `bn.json`, `hi.json`), one namespace per feature; keys are stable and descriptive.
3. Use ICU for plurals and variables; never concatenate sentences.
4. Format numbers, dates and currency with `Intl` helpers (₹, Indian grouping, DD/MM/YYYY).
5. Database `*_i18n` JSON is resolved with `pickLocale` (falls back to `en`).
6. Never translate user-generated text; never bake text into images.
7. Layouts survive +40% text length.
8. The product name comes from `brand.name`; the Hindi translation uses "खाना चक्र".
```json
{ "listings": { "card": {
  "feeds": "{count, plural, one {Feeds # person} other {Feeds # people}}",
  "endsIn": "Ends in {minutes, plural, one {# minute} other {# minutes}}"
} } }
```
```ts
// src/lib/i18n/pick-locale.ts
export type I18nText = Readonly<Record<string, string | null | undefined>> & { en: string };

export function pickLocale(text: I18nText, locale: string): string {
  return text[locale] || text.en;
}
```
```ts
// src/lib/format.ts
export const formatInr = (value: number, locale = 'en-IN'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export const formatDateTime = (iso: string, locale = 'en-IN', timeZone = 'Asia/Kolkata'): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(new Date(iso));
```

## 9. Errors and Logging
- One error type. Codes are stable `UPPER_SNAKE` strings; the UI maps codes to translated messages; the server never sends raw exception text.
- API error body: `{ error: { code, message, details? }, requestId }`.
- **Security-sensitive failures are generic** (the same code and message whether the contact is missing, expired or blocked).
- No `console.log`; use the logger, which **redacts** phone, email, address, tokens, codes and documents.
- Report unexpected errors to Sentry (PII scrubbing on); never swallow errors silently.
```ts
// src/lib/errors.ts
export type ErrorCode =
  | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_FAILED' | 'RATE_LIMITED'
  | 'HUMAN_CHECK_FAILED' | 'INVALID_CREDENTIALS' | 'CONTACT_NOT_AVAILABLE'
  | 'CATEGORY_NOT_LISTABLE' | 'PHOTO_REQUIRED' | 'WINDOW_TOO_LONG'
  | 'SERVICE_UNAVAILABLE' | 'INTERNAL';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(code);
  }
}

export function toErrorResponse(e: unknown, requestId?: string): Response {
  const err = e instanceof AppError ? e : new AppError('INTERNAL', 500);
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  const retry = err.details?.retryAfter;
  if (err.code === 'RATE_LIMITED' && typeof retry === 'number') headers.set('Retry-After', String(retry));
  return Response.json(
    { error: { code: err.code, message: err.code, details: err.status < 500 ? err.details : undefined }, requestId },
    { status: err.status, headers },
  );
}
```
```ts
// src/lib/logger.ts
import 'server-only';

const SENSITIVE = /(phone|email|address|token|code|password|secret|authorization|cookie|document)/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SENSITIVE.test(k) ? '[redacted]' : redact(v, depth + 1)]),
  );
}

type Level = 'info' | 'warn' | 'error';
function log(level: Level, msg: string, ctx?: Record<string, unknown>, requestId?: string) {
  // eslint-disable-next-line no-console -- the logger is the single allowed console user
  console[level](JSON.stringify({ level, msg, requestId, ...(ctx ? { ctx: redact(ctx) } : {}), ts: new Date().toISOString() }));
}

export const logger = {
  info: (msg: string, ctx?: Record<string, unknown>, requestId?: string) => log('info', msg, ctx, requestId),
  warn: (msg: string, ctx?: Record<string, unknown>, requestId?: string) => log('warn', msg, ctx, requestId),
  error: (msg: string, ctx?: Record<string, unknown>, requestId?: string) => log('error', msg, ctx, requestId),
};
```

## 10. API and Route Handlers
- Order: **authenticate → validate → rate-limit → call the RPC with the user's session → shape the response**. No business rules inline.
- Identity: `getClaims()` for the user id; also `getUser()` for sensitive actions (D26).
- Sensitive operations call RPCs **with the user's session**, never the secret key.
- Mutating routes verify the origin. Status codes: `200/201` ok · `400` validation · `401` not signed in · `403` not allowed (non-sensitive) · `404` not available (sensitive) · `409` conflict · `422` rule violation · `429` limited (with `Retry-After`) · `500` unexpected.
- Lists use cursor pagination (page size ≤ 100). Responses with contacts, codes, documents or admin data send `Cache-Control: no-store`.
```ts
// src/lib/security/origin.ts
import { AppError } from '@/lib/errors';

export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (!origin || !host || new URL(origin).host !== host) throw new AppError('FORBIDDEN', 403);
}
```
```ts
// src/app/api/contacts/[id]/reveal/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RULES } from '@/lib/rate-limit';
import { assertSameOrigin } from '@/lib/security/origin';
import { AppError, toErrorResponse } from '@/lib/errors';

const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    assertSameOrigin(req);
    const { id } = paramsSchema.parse(await ctx.params);

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (!userId) throw new AppError('UNAUTHENTICATED', 401);

    await rateLimit(RULES.reveal, userId); // fails closed

    const { data: rows, error } = await supabase.rpc('reveal_contact', { p_contact_id: id });
    const contact = rows?.[0];
    if (error || !contact) throw new AppError('CONTACT_NOT_AVAILABLE', 404); // one generic answer

    return NextResponse.json({ contact }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return toErrorResponse(e instanceof z.ZodError ? new AppError('VALIDATION_FAILED', 400) : e, requestId);
  }
}
```
(Add `reveal: { name: 'reveal', limit: 30, window: '1 h' }` to `RULES`.)

## 11. Domain Code (`src/domain`)
Pure functions only: no React, Next, Supabase, `window` or scattered `Date.now()`. Inputs in, outputs out. Constants arrive as typed config. Exported functions have TSDoc with the spec reference. Rounding is half up (`Math.round`).
```ts
// src/domain/freshness/freshness.ts
export type Band = 'green' | 'amber' | 'red' | 'expired';
export type FreshnessInput = Readonly<{
  remainingH: number; // hours until the deadline (≤ 0 means expired)
  amberH: number;
  redH: number;
  riskWeight: number; // ≥ 1 for riskier food
}>;
export type FreshnessResult = Readonly<{ score: number; band: Band }>;

const lerp = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);

/**
 * Freshness score (0–100) and band.
 * @see TRD §5.2 · @requirement FR-TRACK-3 · vectors: TESTING §6.1
 */
export function freshness({ remainingH, amberH, redH, riskWeight }: FreshnessInput): FreshnessResult {
  const amber = amberH * riskWeight;
  const red = redH * riskWeight;

  if (remainingH <= 0) return { score: 0, band: 'expired' };
  if (remainingH <= red) return { score: lerp(1, 39, remainingH / red), band: 'red' };
  if (remainingH <= amber) {
    return { score: lerp(40, 69, (remainingH - red) / (amber - red)), band: 'amber' };
  }
  return { score: lerp(70, 100, Math.min(1, (remainingH - amber) / (2 * amber))), band: 'green' };
}
```
```ts
// src/domain/freshness/freshness.test.ts
import { describe, it, expect } from 'vitest';
import { freshness } from './freshness';

const leafy = { amberH: 48, redH: 24, riskWeight: 1.0 };

describe('TC-TRACK-100 [FR-TRACK-3] freshness golden vectors', () => {
  it.each([
    [100, 86, 'green'],
    [48, 69, 'amber'],
    [36, 55, 'amber'],
    [24, 39, 'red'],
    [12, 20, 'red'],
    [0, 0, 'expired'],
    [-5, 0, 'expired'],
  ] as const)('remaining %f h → score %i (%s)', (remainingH, score, band) => {
    expect(freshness({ remainingH, ...leafy })).toEqual({ score, band });
  });

  it('milk (risk 1.3) in amber', () => {
    expect(freshness({ remainingH: 40, amberH: 48, redH: 24, riskWeight: 1.3 })).toEqual({ score: 48, band: 'amber' });
  });

  it('is never lower when more time remains (property)', () => {
    let previous = -1;
    for (let h = 0; h <= 400; h += 1) {
      const { score } = freshness({ remainingH: h, ...leafy });
      expect(score).toBeGreaterThanOrEqual(previous);
      previous = score;
    }
  });
});
```

## 12. Database and SQL Style
| Topic | Rule |
|-------|------|
| Files | `supabase/migrations/YYYYMMDDHHMMSS_short_description.sql`; forward-only; **never edit a merged migration** |
| Naming | `snake_case`; plural tables; indexes `idx_<table>_<cols>`; constraints `<table>_<rule>_chk`; policies `<table>_<action>_<who>` |
| Style | Lower-case keywords; one clause per line; explicit column lists in functions |
| Access rules | Enabled in the **same** migration that creates the table; deny by default; wrap `auth.uid()` as `(select auth.uid())` |
| Grants | `revoke all … from anon, authenticated`, then grant exactly what policies need; **column-level update grants** for user-editable columns |
| Functions | `security definer` only when needed; `set search_path = ''` and schema-qualified names; validate the user; `revoke … from public, anon`, grant to `authenticated`; time via `app_now()`; scheduled functions take `p_now` |
| Safety | No dynamic SQL in `security definer` functions; no secrets in SQL; seeds idempotent |
| Docs | `comment on` for anything non-obvious, especially privacy rules |
| Tests | One pgTAP file per migration: allow and deny cases per role |
| Types | `npm run db:types` after every schema change; commit the result |
```sql
-- 20261015120000_add_example_things.sql  (shape every migration follows)
create table public.example_things (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null constraint example_things_name_chk check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
comment on table public.example_things is 'Example only: shows the required migration shape.';

alter table public.example_things enable row level security;
revoke all on public.example_things from anon, authenticated;
grant select, insert, delete on public.example_things to authenticated;

create policy example_things_select_owner on public.example_things
  for select to authenticated using (owner_id = (select auth.uid()));
create policy example_things_insert_owner on public.example_things
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy example_things_delete_owner on public.example_things
  for delete to authenticated using (owner_id = (select auth.uid()));

create index idx_example_things_owner on public.example_things (owner_id);

create or replace function public.rpc_example_archive(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'unauthenticated';
  end if;
  delete from public.example_things where id = p_id and owner_id = (select auth.uid());
end;
$$;

revoke all on function public.rpc_example_archive(uuid) from public, anon;
grant execute on function public.rpc_example_archive(uuid) to authenticated;
```
```sql
-- supabase/tests/010_example_things.test.sql  (pgTAP: allow and deny)
begin;
select plan(3);

insert into auth.users (id, email) values ('22222222-2222-2222-2222-222222222222', 'a@example.com');

set local role anon;
select throws_ok($$ select * from public.example_things $$, '42501', null, 'anon cannot read');
select throws_ok($$ select public.rpc_example_archive(gen_random_uuid()) $$, '42501', null, 'anon cannot execute the RPC');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select lives_ok($$ select * from public.example_things $$, 'owner can read their own rows');

select * from finish();
rollback;
```

## 13. Accessibility in Code
1. Semantic HTML first (`button` for actions, `a`/`Link` for navigation, headings in order, `label` for fields).
2. ARIA only to fill gaps; never `role="button"` on a `div`.
3. Icon-only controls have an accessible name; decorative images `alt=""`; the 3D canvas and floating art are `aria-hidden`.
4. Dialogs and sheets use the shared primitives (focus trap, `Esc`, focus return).
5. Status = colour + icon + text; veg/non-veg uses different shapes plus text.
6. `aria-live` only for meaningful updates.
7. Everything works by keyboard, including camera and map alternatives.
8. The verified badge is a `button type="button"` with an accessible name and a tooltip on hover, focus and tap.
```tsx
// FAQ item pattern (Radix accordion via shadcn/ui, restyled)
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FaqList({ items }: { items: { slug: string; question: string; answerHtml: string }[] }) {
  return (
    <Accordion type="multiple">
      {items.map((item) => (
        <AccordionItem key={item.slug} value={item.slug} id={item.slug}>
          <AccordionTrigger data-testid="faq-trigger">{item.question}</AccordionTrigger>
          <AccordionContent>{/* answers come from the sanitised-Markdown component */}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

## 14. Security Rules in Code (short list; full rules in SECURITY.md)
- Never import `@/lib/supabase/admin` outside the approved modules; never expose the secret key, push private key or cron secret.
- Validate every input on the server; never trust the client or AI/OCR output.
- No `dangerouslySetInnerHTML` except the sanitised-Markdown component.
- Redirect targets pass through `safeNext()`; outbound fetches use allow-listed hosts only.
- Contacts, exact locations, codes and documents never appear in URLs, logs, push, email, Realtime or caches.
- Reject phone numbers and emails inside free-text listing fields.
- Use `getClaims()` (and `getUser()` for sensitive actions); never `getSession()` on the server.
- Every new table or function ships with policies, grants and tests.
```ts
// src/lib/safe-next.ts
export function safeNext(value: string | null | undefined, fallback = '/home'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}
```
```ts
// src/lib/text-hygiene.ts — reject phone numbers and emails in free text (FR-SHARE-16)
const PHONE = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;

export function containsContactInfo(text: string): boolean {
  return PHONE.test(text.replace(/[()]/g, '')) || EMAIL.test(text);
}
```

## 15. Performance Rules
- Route-level code splitting; dynamic import for map, 3D, OCR/classifier and charts.
- Budgets (TRD §4.2) are enforced by `size-limit`.
- Images through `next/image` or pre-optimised WebP; photos compressed on the device.
- Virtualise long lists; paginate queries; avoid N+1.
- Clean up Realtime channels, timers, listeners and workers on unmount.
- Debounce search and geocoding; never call third-party APIs from the browser.
- Reserve space for images, maps and fonts to avoid layout shift.
```tsx
// Lazy 3D scene, client-only, never in other routes' bundles
'use client';
import dynamic from 'next/dynamic';

export const Scene3D = dynamic(() => import('./scene-3d'), { ssr: false, loading: () => null });
```

## 16. Comments and Documentation
Comment **why**, not what. Public domain functions get TSDoc with `@see` (spec section) and `@requirement` (FR ID). TODO formats: `TODO(source): …` for missing facts, `TODO(owner): …` for work; every TODO has an issue or is removed before merge. No commented-out code; no emoji in code or commit messages. Update the relevant `docs/` file in the same pull request when behaviour, schema or decisions change.

## 17. Tests (style summary; details in TESTING.md)
Names start with the ID and requirement. Arrange → Act → Assert; one behaviour per test; test behaviour, not implementation. Use factories and fixtures; **fake timers or the injected clock** for time; never `sleep`. Query by role or label first, `data-testid` last. Snapshots only for stable visual components.
```ts
// tests/e2e/help/faq.spec.ts
import { test, expect } from '@playwright/test';

test('TC-HELP-001 [FR-SITE-8] every FAQ item opens and closes', async ({ page }) => {
  await page.goto('/en/faq');
  const triggers = page.getByTestId('faq-trigger');
  const count = await triggers.count();
  expect(count).toBeGreaterThan(10);

  for (let i = 0; i < count; i++) {
    const trigger = triggers.nth(i);
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.press('Enter'); // keyboard closes it
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  }
});
```

## 18. Git, Commits and Pull Requests
- **Branches:** `feat/<area>-<name>`, `fix/<area>-<name>`, `docs/<topic>`, `chore/<topic>`.
- **Conventional Commits:** `type(scope): summary` — types `feat, fix, docs, style, refactor, perf, test, build, ci, chore`; scopes `auth, profile, inventory, capture, recipes, nutrition, listings, requests, events, orgs, emergency, waste, impact, notifications, help, admin, landing, db, ci, docs, deps, design`. Example: `feat(listings): require 1–4 photos before publish`.
- **Pull requests:** small, squash-merged, draft until checks pass; description lists summary, requirement IDs, screenshots (light and dark), tests, migrations (yes/no), docs updated (yes/no), items needing a decision.
- **CODEOWNERS:** `supabase/migrations/**`, `src/lib/supabase/**`, `.github/**`, `docs/SECURITY.md`, `src/features/admin/**`.
- Never commit secrets, `.env*` (except `.env.example`), real personal data or build output.
```js
// commitlint.config.js
module.exports = { extends: ['@commitlint/config-conventional'] };
```
**Reviewer checklist**
- [ ] Meets the requirement and acceptance criteria?
- [ ] Types, lint, tests and a11y checks pass; new behaviour tested?
- [ ] New table/function has policies, grants and tests?
- [ ] No hard-coded strings, hex colours, `any`, `console.log`, secrets or PII in logs?
- [ ] Privacy rules intact (contacts, locations, documents, admin 404)?
- [ ] Performance budgets and bundle impact acceptable?
- [ ] Docs and types updated; placeholders and questions listed?

## 19. Dependencies
Follow AGENTS §6.3: purpose, licence, bundle size, maintenance status, free alternative considered. Commit the lockfile; install with `npm ci` in CI; review install scripts; remove unused packages. Pin and review newly added packages (supply-chain attacks on npm packages happen). Prefer built-in platform features.

## 20. Do / Don't
| Do | Don't |
|----|-------|
| `useTranslations('listings.card')` | Type English text into JSX |
| `bg-surface text-ink-muted` | `bg-[#FFFFFF] text-gray-500` |
| Put rules in `domain/` or SQL | Put rules in a component |
| Call RPCs with the user's session | Use the secret key to "make it work" |
| Return generic errors for sensitive failures | Say "listing expired" vs "no such listing" |
| Fake the clock in tests | `await sleep(60_000)` |
| `getClaims()` for identity | `getSession()` on the server |
| `await params` | Read `params.id` directly (Promise in Next.js 16) |
| `npm run lint` (ESLint CLI) | `next lint` (removed) |
| Small PR with tests and docs | One giant PR "fixes stuff" |

## 21. Open Items
CS-1 choose the boundary-enforcement plugin and write its config in Phase 1 · CS-2 confirm Tailwind, Next.js, next-intl and animation-package versions at project start · CS-3 decide on Storybook.

---
*End of CODE_STYLE v1.1.*