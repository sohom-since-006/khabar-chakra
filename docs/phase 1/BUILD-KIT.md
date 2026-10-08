# PHASE 1 BUILD KIT — Part 1 of 2 (setup, core code, database)

> **Version 1.0** · Status: Final draft, usable directly. Read AGENTS.md first, then PHASE-1-SPEC.md. Part 2 (features, tests, CI, deploy, remaining task prompts) follows.
> **Code policy:** the code below is a verified-pattern starting point. The AI assistant must **read the installed library docs and adapt**; if a snippet and the installed docs disagree, the docs win and the difference goes in the report.

## 1. What the research found (October 2026)
| Topic | Finding | Effect |
|-------|---------|--------|
| Next.js | 16.x line is current (16.3.3 and 15.5.24 shipped on 25 Aug 2026 to fix two critical issues). Needs Node **20.9+**. `middleware.ts` is now **`proxy.ts`** (Node runtime). `next lint` is gone (use the ESLint CLI). `params` and `cookies()` are async. Security releases are frequent. | Install `next@latest`, record versions, patch within 48 h |
| next-intl v4 | `createMiddleware(routing)` is called inside `proxy.ts`; plugin in `next.config.ts`; `hasLocale` to validate | i18n files below |
| Supabase SSR | Env names are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. A proxy must refresh sessions. Use **`getClaims()`** to protect pages and data; `getUser()` for a fresh server-confirmed record; **never trust `getSession()` on the server**. Cached responses carrying `Set-Cookie` can leak sessions. | Auth code and security rules below |
| CSP | Nonce-based CSP **forces dynamic rendering** (no static pages, no CDN caching); hash-based SRI is the experimental alternative for static pages (Turbopack support added in 16.2). | Decision D25 |
| 3D | `@react-three/fiber` 9.5 supports React 19.0–19.2; `@react-three/drei` 10 | Use these majors |
| Tailwind/shadcn | Tailwind v4 is CSS-first (no `tailwind.config.js`); `npx shadcn@latest init` creates `components.json` and CSS variables | Token file below |
| **Not verified (check at project start)** | Zod major version · animation package name (`motion` vs `framer-motion`) · exact `supabase/config.toml` setting names · pgTAP helper availability · Supabase Mumbai on the free plan · exact install-time versions | Marked "VERIFY" |

## 2. Decisions added (add to AGENTS.md §2)
| ID | Decision |
|----|----------|
| D25 | **All pages are rendered per request** (no static/ISR HTML caching) in v1. This allows nonce-based CSP later and avoids session-cookie caching risks. Revisit with SRI if traffic grows. |
| D26 | Identity checks on the server use **`getClaims()`**. For sensitive actions (password change, delete account, admin actions, document opens) also confirm with **`getUser()`** so revoked sessions are rejected. Never use `getSession()` for decisions. |
| D27 | Supabase key names: **publishable key** (browser) and **secret key** (server only). Older projects may still show anon/service_role; map them to the same variables. |
| D28 | `app_now()` is simply `now()` in the database. **Tests redefine it inside their own transaction** (rolled back), so there is no way to override time in production. |
| D29 | Phase 1 ships an **enforced baseline CSP** (frame, object, base, form, connect, image and font restrictions) and a nonce-based policy in **report-only** mode; task T1.8 flips scripts to nonce-only once no violations appear. |
| D30 | `locales` is `['en']` until Phase 6; the language switcher shows Bengali and Hindi as "Coming soon". |

## 3. Bootstrap
Prerequisites: Node.js 20.9+ (`node -v`), npm, Git, Docker Desktop.
```bash
# 1. Create the app (answer prompts: TypeScript yes, ESLint yes, Tailwind yes, src/ yes, App Router yes, import alias @/*)
npx create-next-app@latest khabar-chakra --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd khabar-chakra

# 2. Runtime dependencies
npm i @supabase/supabase-js @supabase/ssr next-intl next-themes zod react-hook-form @hookform/resolvers \
  @tanstack/react-query motion three @react-three/fiber @react-three/drei lucide-react clsx tailwind-merge \
  class-variance-authority @marsidev/react-turnstile @upstash/ratelimit @upstash/redis server-only

# 3. Dev dependencies
npm i -D @types/three vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom @playwright/test @axe-core/playwright prettier prettier-plugin-tailwindcss \
  husky lint-staged @commitlint/cli @commitlint/config-conventional supabase eslint-plugin-boundaries

# 4. UI kit (choose the Radix base and the default style when asked)
npx shadcn@latest init
npx shadcn@latest add button input label checkbox accordion tabs dropdown-menu sheet dialog tooltip sonner

# 5. Local database
npx supabase init
npm run db:start      # defined below; prints the local URL and keys

# 6. Record versions
npm ls --depth=0 > docs/VERSIONS.md
```
Notes: `framer-motion` was renamed `motion` (import from `motion/react`) — **VERIFY**. If a peer-dependency warning appears for React 19, install the latest version of that library rather than forcing. Commit `package-lock.json`. In CI use `npm ci`.

### 3.1 package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:https": "next dev --experimental-https",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test --grep @a11y",
    "test:db": "supabase test db",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:push": "supabase db push",
    "db:types": "supabase gen types typescript --local > src/types/database.ts"
  }
}
```
(`--experimental-https` is Next's local HTTPS flag — **VERIFY** it exists in the installed version.)

### 3.2 Tooling files
`.prettierrc`: `{ "singleQuote": true, "semi": true, "trailingComma": "all", "printWidth": 100, "plugins": ["prettier-plugin-tailwindcss"] }`
`commitlint.config.js`: `module.exports = { extends: ['@commitlint/config-conventional'] };`
Husky: run `npx husky init`, set `.husky/pre-commit` to `npx lint-staged` and `.husky/commit-msg` to `npx commitlint --edit "$1"`.
lint-staged (in package.json): `"lint-staged": { "*.{ts,tsx}": ["eslint --fix", "prettier --write"], "*.{json,md,css}": ["prettier --write"] }`.
Add gitleaks as an additional pre-commit step (install separately) and as a CI step.
ESLint (extend the generated `eslint.config.mjs`): add rules from CODE_STYLE §2.3 — `no-console` (warn → error), `@typescript-eslint/no-explicit-any`, `no-restricted-imports` for `@/lib/supabase/admin` (allowed only in files listed in SECURITY §6.3), and `eslint-plugin-boundaries` for ARCHITECTURE §4.2. Keep `jsx-a11y` rules from the Next config.

## 4. Environment
`.env.example` (names only; **never commit `.env.local`**):
```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
# Cloudflare Turnstile TEST keys (always pass) — replace in staging/production
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
IP_HASH_SALT=change-me-to-a-long-random-string
INTERNAL_CRON_SECRET=change-me-to-a-long-random-string
ADMIN_ALERT_EMAIL=
SENTRY_DSN=
```
`npm run db:start` prints local keys. Newer CLI versions print a *publishable* and a *secret* key; older ones print *anon* and *service_role* — put them in the variables above either way (**VERIFY**).

## 5. Core Code

### 5.1 `src/lib/env.client.ts` and `src/lib/env.server.ts`
```ts
// src/lib/env.client.ts
import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
});

// Each value must be referenced explicitly so Next.js can inline it in the browser bundle.
export const clientEnv = schema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});
```
```ts
// src/lib/env.server.ts
import 'server-only';
import { z } from 'zod';

const schema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  IP_HASH_SALT: z.string().min(16),
  INTERNAL_CRON_SECRET: z.string().min(16),
  ADMIN_ALERT_EMAIL: z.string().email().optional().or(z.literal('')),
});

export const serverEnv = schema.parse(process.env);
```
CI needs dummy values for all of these (use the example file) so the build does not fail.

### 5.2 `src/lib/errors.ts`
```ts
export type ErrorCode =
  | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_FAILED'
  | 'RATE_LIMITED' | 'HUMAN_CHECK_FAILED' | 'SERVICE_UNAVAILABLE' | 'INTERNAL';

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
(User-facing wording comes from translated messages keyed by `code`; never send raw exception text.)

### 5.3 Supabase clients
```ts
// src/lib/supabase/client.ts  (browser)
import { createBrowserClient } from '@supabase/ssr';
import { clientEnv } from '@/lib/env.client';

export function createClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
```
```ts
// src/lib/supabase/server.ts  (server components, actions, route handlers)
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { clientEnv } from '@/lib/env.client';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component: the proxy already refreshes sessions.
          }
        },
      },
    },
  );
}
```
```ts
// src/lib/supabase/admin.ts  (secret key: approved modules ONLY — see SECURITY §6.3)
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { clientEnv } from '@/lib/env.client';
import { serverEnv } from '@/lib/env.server';

export function createAdminClient() {
  return createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```
Server identity helper (D26):
```ts
// src/lib/auth/claims.ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function getClaimsOrNull() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  return data.claims; // { sub, email, aal, ... }
}

/** For sensitive actions: also ask the Auth server, so revoked sessions are rejected. */
export async function requireFreshUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
```

### 5.4 `src/proxy.ts` (session refresh + locale routing + request ID)
Order matters: refresh the session **first** (so Server Components see the new token), then run next-intl, then copy the refreshed cookies onto the final response. **VERIFY with test TC-AUTH-018** (stay signed in across a short token lifetime).
```ts
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const handleI18n = createIntlMiddleware(routing);

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function proxy(request: NextRequest) {
  const refreshed: CookieToSet[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: CookieToSet[]) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value)); // for Server Components
          refreshed.push(...list); // for the browser
        },
      },
    },
  );
  await supabase.auth.getClaims(); // refreshes the token when needed

  const isApi = request.nextUrl.pathname.startsWith('/api');
  const response = isApi ? NextResponse.next({ request }) : handleI18n(request);

  refreshed.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  if (refreshed.length > 0) response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('x-request-id', crypto.randomUUID());
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|woff2?)$).*)'],
};
```

### 5.5 i18n (English only for now, D30)
```ts
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en'], // add 'bn' and 'hi' in Phase 6
  defaultLocale: 'en',
  localePrefix: 'always',
});
```
```ts
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
});
```
```ts
// src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```
`messages/en.json` starts with the keys in the Spec §6 (namespaces: `auth`, `common`, `home`, `available`, `contact`, `settings`, `footer`, `legal`, `landing`, `faq`, `help`, `team`).

### 5.6 `next.config.ts` (headers; D29)
```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isDev = process.env.NODE_ENV !== 'production';
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : '';
const supabaseWs = supabaseOrigin.replace(/^http/, 'ws');

// Enforced baseline. Task T1.8 replaces 'unsafe-inline' for scripts with a per-request nonce.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs} https://*.sentry.io`,
  "worker-src 'self' blob:",
  'frame-src https://challenges.cloudflare.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
```

### 5.7 Fonts and root layout
```ts
// src/lib/fonts.ts
import { Nunito, Caveat } from 'next/font/google';

export const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', display: 'swap' });
export const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap', weight: ['600', '700'] });
```
```tsx
// src/app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { routing } from '@/i18n/routing';
import { nunito, caveat } from '@/lib/fonts';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'Khabar Chakra — Save • Share • Sustain', template: '%s · Khabar Chakra' },
  description: 'Track food freshness, share surplus food nearby, and sort waste the right way.',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} className={`${nunito.variable} ${caveat.variable}`} suppressHydrationWarning>
      <body className="bg-page text-ink font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```
(next-intl v4 passes locale and messages to client components automatically through the provider — **VERIFY** with the installed docs. Also add the `not-found.tsx` handling that the next-intl docs describe for unmatched routes.)

### 5.8 Design tokens: `src/app/globals.css`
```css
@import "tailwindcss";

/* ---- Market Fresh tokens (DESIGN SYSTEM §3). Components use utilities, never hex. ---- */
:root {
  --kc-bg:#FAFDF6; --kc-sunken:#EEF5E8; --kc-surface:#FFFFFF; --kc-surface-2:#EEF5E8;
  --kc-border:#DDE6D5; --kc-border-input:#6F7F66;
  --kc-text:#14251B; --kc-text-muted:#4A5D52;
  --kc-primary:#0B6E3C; --kc-primary-hover:#085A31; --kc-on-primary:#FFFFFF;
  --kc-highlight:#FFC93C; --kc-highlight-hover:#F2B91F; --kc-on-highlight:#053B20;
  --kc-link:#0B6E3C; --kc-danger:#D6381F; --kc-on-danger:#FFFFFF;
  --kc-info:#2457A6; --kc-info-bg:#E6EEFA; --kc-focus:#07502A;
  --kc-fresh-bg:#E4F5E8; --kc-fresh-fg:#07502A; --kc-fresh-ring:#27A04A;
  --kc-soon-bg:#FFF3CC; --kc-soon-fg:#5A3A00; --kc-soon-ring:#B97A00;
  --kc-expiring-bg:#FDE7E1; --kc-expiring-fg:#8B2412; --kc-expiring-ring:#D6381F;
  --kc-radius:0.75rem;
}
.dark {
  --kc-bg:#0A1912; --kc-sunken:#07120D; --kc-surface:#12281D; --kc-surface-2:#1A382A;
  --kc-border:rgb(242 245 234 / 0.12); --kc-border-input:#7E9486;
  --kc-text:#F2F5EA; --kc-text-muted:#B4C5B8;
  --kc-primary:#34B45B; --kc-primary-hover:#4CC472; --kc-on-primary:#06140D;
  --kc-highlight:#FFC93C; --kc-highlight-hover:#FFD966; --kc-on-highlight:#053B20;
  --kc-link:#6FD58A; --kc-danger:#FF7A63; --kc-on-danger:#06140D;
  --kc-info:#8FB4F2; --kc-info-bg:rgb(143 180 242 / 0.14); --kc-focus:#FFC93C;
  --kc-fresh-bg:rgb(52 180 91 / 0.16); --kc-fresh-fg:#A8E8BB; --kc-fresh-ring:#34B45B;
  --kc-soon-bg:rgb(255 201 60 / 0.16); --kc-soon-fg:#FFE08A; --kc-soon-ring:#FFC93C;
  --kc-expiring-bg:rgb(255 122 99 / 0.18); --kc-expiring-fg:#FFB3A3; --kc-expiring-ring:#FF7A63;
}

/* ---- Map our tokens onto the variables shadcn/ui components expect ---- */
:root, .dark {
  --background:var(--kc-bg); --foreground:var(--kc-text);
  --card:var(--kc-surface); --card-foreground:var(--kc-text);
  --popover:var(--kc-surface); --popover-foreground:var(--kc-text);
  --primary:var(--kc-primary); --primary-foreground:var(--kc-on-primary);
  --secondary:var(--kc-sunken); --secondary-foreground:var(--kc-text);
  --muted:var(--kc-sunken); --muted-foreground:var(--kc-text-muted);
  --accent:var(--kc-surface-2); --accent-foreground:var(--kc-text);
  --destructive:var(--kc-danger);
  --border:var(--kc-border); --input:var(--kc-border-input); --ring:var(--kc-focus);
  --radius:var(--kc-radius);
}

/* ---- Utilities available as bg-page, text-ink, border-line, bg-highlight, ... ---- */
@theme inline {
  --color-page:var(--kc-bg); --color-sunken:var(--kc-sunken); --color-surface:var(--kc-surface);
  --color-surface-2:var(--kc-surface-2); --color-line:var(--kc-border); --color-line-input:var(--kc-border-input);
  --color-ink:var(--kc-text); --color-ink-muted:var(--kc-text-muted);
  --color-on-primary:var(--kc-on-primary); --color-primary-hover:var(--kc-primary-hover);
  --color-highlight:var(--kc-highlight); --color-highlight-hover:var(--kc-highlight-hover);
  --color-on-highlight:var(--kc-on-highlight);
  --color-link:var(--kc-link); --color-danger:var(--kc-danger); --color-on-danger:var(--kc-on-danger);
  --color-info:var(--kc-info); --color-info-bg:var(--kc-info-bg); --color-focus:var(--kc-focus);
  --color-fresh-bg:var(--kc-fresh-bg); --color-fresh-fg:var(--kc-fresh-fg); --color-fresh-ring:var(--kc-fresh-ring);
  --color-soon-bg:var(--kc-soon-bg); --color-soon-fg:var(--kc-soon-fg); --color-soon-ring:var(--kc-soon-ring);
  --color-expiring-bg:var(--kc-expiring-bg); --color-expiring-fg:var(--kc-expiring-fg); --color-expiring-ring:var(--kc-expiring-ring);
  --font-sans:var(--font-nunito), system-ui, sans-serif;
  --font-script:var(--font-caveat), cursive;
}

@layer base {
  *:focus-visible { outline:3px solid var(--kc-focus); outline-offset:2px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; scroll-behavior:auto !important; }
  }
}
.accent { font-family:var(--font-script); font-weight:700; }
```
Naming note: the DESIGN SYSTEM "accent" (Mango) is the utility **`highlight`** here, because shadcn already uses `accent` for hover backgrounds. After `shadcn init`, delete the colour blocks it generated and keep this file's token and mapping blocks. If the installed shadcn version generates different variable names, adapt the mapping block, not the tokens.

### 5.9 Helpers
```ts
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```
```ts
// src/lib/rate-limit.ts
import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { serverEnv } from '@/lib/env.server';
import { AppError } from '@/lib/errors';

export type LimitRule = { name: string; limit: number; window: `${number} ${'s' | 'm' | 'h' | 'd'}` };

export const RULES = {
  signup: { name: 'signup', limit: 6, window: '1 h' },
  login: { name: 'login', limit: 5, window: '15 m' },
  contact: { name: 'contact', limit: 3, window: '1 h' },
} as const satisfies Record<string, LimitRule>;

const redis =
  serverEnv.UPSTASH_REDIS_REST_URL && serverEnv.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: serverEnv.UPSTASH_REDIS_REST_URL, token: serverEnv.UPSTASH_REDIS_REST_TOKEN })
    : null;

const limiters = new Map<string, Ratelimit>();

/** Throws RATE_LIMITED when exceeded. Fails CLOSED in production if Upstash is not configured. */
export async function rateLimit(rule: LimitRule, key: string): Promise<void> {
  if (!redis) {
    if (process.env.NODE_ENV === 'production') throw new AppError('SERVICE_UNAVAILABLE', 503);
    return;
  }
  let limiter = limiters.get(rule.name);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(rule.limit, rule.window),
      prefix: `rl:${rule.name}`,
    });
    limiters.set(rule.name, limiter);
  }
  const { success, reset } = await limiter.limit(key);
  if (!success) throw new AppError('RATE_LIMITED', 429, { retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) });
}
```
```ts
// src/lib/turnstile.ts
import 'server-only';
import { serverEnv } from '@/lib/env.server';

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const body = new URLSearchParams({ secret: serverEnv.TURNSTILE_SECRET_KEY, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false; // fail closed
  }
}
```
```ts
// src/lib/ip.ts — salted hash of the client IP for abuse detection (never store raw IPs)
import 'server-only';
import { createHash } from 'node:crypto';
import { serverEnv } from '@/lib/env.server';

export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}
export const hashIp = (ip: string) =>
  createHash('sha256').update(`${serverEnv.IP_HASH_SALT}:${ip}`).digest('hex');
```
```ts
// src/lib/safe-next.ts — only same-site paths are allowed as redirect targets
export function safeNext(value: string | null | undefined, fallback = '/en/home'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}
```

## 6. Supabase Configuration (`supabase/config.toml`)
Intended settings (the file is generated by `supabase init`; match the **setting names in your generated file**, **VERIFY**): site URL `http://localhost:3000` and redirect URLs `http://localhost:3000/**` · email confirmations **on** · double-confirm email changes **on** · secure password change **on** · minimum password length **8** · JWT expiry 3600 s · refresh-token rotation **on** · email OTP/link lifetime 24 h for sign-up and ≤ 1 h for recovery (if separately configurable) · CAPTCHA provider Turnstile with its secret read from an environment variable · seed paths include `./seed/reference/*.sql`. Local test mail appears at `http://localhost:54324`. In staging/production set the same options in the dashboard (Authentication → Providers / URL configuration / Rate limits / Bot detection) and add custom SMTP.

## 7. Database — Phase 1 Migrations
Run order: `0001` → `0002` → `0003`. Generate with `npx supabase migration new <name>`, paste, then `npm run db:reset && npm run db:types`.

### 7.1 `0001_extensions_and_enums.sql`
```sql
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- Tables created later must not be readable by the anonymous role unless a policy and grant say so.
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;

create type public.account_type as enum ('member', 'business', 'ngo');
create type public.contact_topic as enum
  ('food_info', 'donation', 'tech_support', 'partnership', 'food_distribution', 'privacy_request', 'other');
create type public.inbox_status as enum ('new', 'read', 'replied', 'archived', 'spam');
```

### 7.2 `0002_core_identity.sql`
```sql
-- Time helper: always now() in production. pgTAP tests redefine it inside their own rolled-back transaction (D28).
create or replace function public.app_now()
returns timestamptz language sql stable set search_path = '' as $$ select now(); $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  avatar_path text,
  phone text check (phone is null or phone ~ '^\+?[0-9]{8,15}$'),
  account_type public.account_type not null default 'member',
  city text check (city is null or char_length(city) <= 80),
  area_label text check (area_label is null or char_length(area_label) <= 80),
  household_size smallint not null default 1 check (household_size between 1 and 50),
  locale text not null default 'en' check (locale in ('en', 'bn', 'hi')),
  timezone text not null default 'Asia/Kolkata',
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  reduce_motion boolean not null default false,
  onboarding_completed boolean not null default false,
  adult_confirmed_at timestamptz,
  suspended_at timestamptz,
  suspension_reason text,
  leaderboard_opt_in boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.notification_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  in_app boolean not null default true,
  push boolean not null default false,
  email_digest boolean not null default false,
  lead_time_hours smallint not null default 24 check (lead_time_hours between 1 and 168),
  quiet_start time,
  quiet_end time,
  emergency_alerts boolean not null default false,
  alert_radius_km smallint not null default 5 check (alert_radius_km between 1 and 50),
  updated_at timestamptz not null default now()
);
create trigger trg_notification_preferences_updated before update on public.notification_preferences
  for each row execute function public.set_updated_at();

create table public.admin_users (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles (id)
);

-- Helper checks used by policies and functions.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
     and coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2';
$$;

create or replace function public.is_email_verified()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  );
$$;

-- Create profile + preferences when someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_name text;
  v_type public.account_type;
begin
  v_name := left(
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Friend'
    ), 60);
  if char_length(v_name) < 2 then v_name := 'Friend'; end if;

  v_type := case new.raw_user_meta_data ->> 'account_type'
              when 'business' then 'business'::public.account_type
              when 'ngo' then 'ngo'::public.account_type
              else 'member'::public.account_type
            end;

  insert into public.profiles (id, display_name, account_type, adult_confirmed_at)
  values (
    new.id, v_name, v_type,
    case when (new.raw_user_meta_data ->> 'adult_confirmed') = 'true' then now() end
  );
  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Self-service functions (never trust the client with protected columns).
create or replace function public.rpc_confirm_adult()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'unauthenticated'; end if;
  update public.profiles
     set adult_confirmed_at = coalesce(adult_confirmed_at, now())
   where id = (select auth.uid());
end;
$$;

create or replace function public.rpc_delete_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'unauthenticated'; end if;
  update public.profiles set deleted_at = now() where id = (select auth.uid());
  -- Sessions are revoked by the server action (signOut) right after this call.
  -- The 30-day purge job is added in Phase 3; until then purge manually (runbook).
end;
$$;

-- Function grants: nothing executable by anonymous callers.
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_email_verified() from public, anon;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.rpc_confirm_adult() from public, anon;
revoke all on function public.rpc_delete_account() from public, anon;
revoke all on function public.app_now() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_email_verified() to authenticated;
grant execute on function public.rpc_confirm_adult() to authenticated;
grant execute on function public.rpc_delete_account() to authenticated;
grant execute on function public.app_now() to authenticated;

-- Row-level access rules.
alter table public.profiles enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.admin_users enable row level security;

revoke all on public.profiles, public.notification_preferences, public.admin_users from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name, avatar_path, phone, city, area_label, household_size, locale, timezone,
              theme, reduce_motion, onboarding_completed, leaderboard_opt_in)
  on public.profiles to authenticated;
create policy profiles_select_own on public.profiles for select to authenticated
  using (id = (select auth.uid()) and deleted_at is null);
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid()) and deleted_at is null)
  with check (id = (select auth.uid()));

grant select, update (in_app, push, email_digest, lead_time_hours, quiet_start, quiet_end,
                      emergency_alerts, alert_radius_km)
  on public.notification_preferences to authenticated;
create policy prefs_select_own on public.notification_preferences for select to authenticated
  using (user_id = (select auth.uid()));
create policy prefs_update_own on public.notification_preferences for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- admin_users: no direct access for app roles; rows are added by a database owner with SQL.
```
Note: `grant select, update (…)` combines table-level select with column-level update; if your Postgres version rejects the combined form, split into two grant statements.

### 7.3 `0003_content_and_inbox.sql`
```sql
create table public.faq_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_i18n jsonb not null check (jsonb_typeof(title_i18n -> 'en') = 'string'),
  icon text,
  sort_order integer not null default 0,
  is_published boolean not null default true
);

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.faq_categories (id) on delete cascade,
  slug text not null unique,
  question_i18n jsonb not null check (jsonb_typeof(question_i18n -> 'en') = 'string'),
  answer_i18n jsonb not null check (jsonb_typeof(answer_i18n -> 'en') = 'string'),
  audience text not null default 'all' check (audience in ('all', 'donor', 'ngo', 'event_host', 'household')),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);
create index idx_faq_items_category on public.faq_items (category_id, sort_order);
create trigger trg_faq_items_updated before update on public.faq_items
  for each row execute function public.set_updated_at();

create table public.help_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  section text not null check (section in
    ('getting_started', 'donors', 'event_hosts', 'ngos', 'food_safety', 'waste', 'troubleshooting')),
  title_i18n jsonb not null check (jsonb_typeof(title_i18n -> 'en') = 'string'),
  body_i18n jsonb not null check (jsonb_typeof(body_i18n -> 'en') = 'string'),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);
create trigger trg_help_articles_updated before update on public.help_articles
  for each row execute function public.set_updated_at();

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  rollout_percent smallint not null default 100 check (rollout_percent between 0 and 100),
  note text
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 5 and 254),
  topic public.contact_topic not null,
  subject text not null check (char_length(subject) between 3 and 120),
  message text not null check (char_length(message) between 10 and 2000),
  status public.inbox_status not null default 'new',
  internal_note text,
  handled_by uuid references public.profiles (id) on delete set null,
  handled_at timestamptz,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index idx_contact_messages_status on public.contact_messages (status, created_at desc);

-- Access rules
alter table public.faq_categories enable row level security;
alter table public.faq_items enable row level security;
alter table public.help_articles enable row level security;
alter table public.site_settings enable row level security;
alter table public.feature_flags enable row level security;
alter table public.contact_messages enable row level security;

revoke all on public.faq_categories, public.faq_items, public.help_articles,
              public.site_settings, public.feature_flags, public.contact_messages
  from anon, authenticated;

grant select on public.faq_categories, public.faq_items, public.help_articles,
                public.site_settings, public.feature_flags to anon, authenticated;
grant insert, update, delete on public.faq_categories, public.faq_items, public.help_articles,
                public.site_settings, public.feature_flags to authenticated;
grant select, update, delete on public.contact_messages to authenticated; -- no INSERT: the server inserts with the secret key

create policy faq_categories_read on public.faq_categories for select to anon, authenticated using (is_published);
create policy faq_categories_admin on public.faq_categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy faq_items_read on public.faq_items for select to anon, authenticated using (is_published);
create policy faq_items_admin on public.faq_items for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy help_articles_read on public.help_articles for select to anon, authenticated using (is_published);
create policy help_articles_admin on public.help_articles for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy site_settings_read_public on public.site_settings for select to anon, authenticated
  using (key in ('public_contact', 'maintenance_mode'));
create policy site_settings_admin on public.site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy feature_flags_read on public.feature_flags for select to anon, authenticated using (true);
create policy feature_flags_admin on public.feature_flags for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy contact_messages_admin on public.contact_messages for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
```

### 7.4 Reference seed `supabase/seed/reference/001_settings.sql`
```sql
insert into public.site_settings (key, value) values
  ('public_contact', '{"tech_support": {"status": "coming_soon", "phone": null, "email": null}, "form_enabled": true}'),
  ('maintenance_mode', '{"enabled": false}'),
  ('legal_versions', '{"terms": "draft-2026-10", "privacy": "draft-2026-10", "listing_confirmation": "draft-2026-10"}')
on conflict (key) do nothing;

insert into public.feature_flags (key, enabled, note) values
  ('three_d_background', true, 'Landing 3D scene'),
  ('ai_scan', false, 'Phase 2'),
  ('push_notifications', false, 'Phase 3'),
  ('event_mode', false, 'Phase 4'),
  ('swap', false, 'Phase 4'),
  ('emergency_mode', false, 'Phase 4'),
  ('vision_fallback', false, 'Off unless the team approves it')
on conflict (key) do nothing;
```
`002_faq.sql` and `003_help.sql`: generate from PHASE-1-SPEC §6.5 and §6.6 (categories, the 12 questions, slugs from the question text, Markdown answers, `on conflict do nothing`). Review every answer for accuracy against what Phase 1 actually offers.

### 7.5 Database test `supabase/tests/001_phase1_access.test.sql` (pgTAP template)
```sql
begin;
select plan(8);

-- Anonymous visitors: public content only
set local role anon;
select is((select count(*) from public.faq_items where is_published), (select count(*) from public.faq_items),
          'TC-DB-001 anon can read published FAQ items');
select throws_ok($$ select * from public.profiles $$, '42501', null, 'TC-PRIV-001 anon cannot read profiles');
select throws_ok($$ select * from public.contact_messages $$, '42501', null, 'TC-PRIV-001 anon cannot read the contact inbox');
select throws_ok($$ select public.is_admin() $$, '42501', null, 'TC-SEC-023 anon cannot execute helper functions');
select throws_ok($$ select public.rpc_delete_account() $$, '42501', null, 'TC-SEC-023 anon cannot execute RPCs');
reset role;

-- Tests redefine the clock inside this transaction only (D28); rolled back below.
create or replace function public.app_now() returns timestamptz language sql stable as
$$ select '2026-10-04 20:59:59+05:30'::timestamptz $$;
select is(public.app_now(), '2026-10-04 20:59:59+05:30'::timestamptz, 'TC-DB-002 test clock override works');

-- A signed-up user gets a profile and preferences automatically
insert into auth.users (id, email, raw_user_meta_data)
values ('11111111-1111-1111-1111-111111111111', 'test1@example.com',
        '{"display_name": "Test One", "adult_confirmed": "true"}');
select is((select display_name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
          'Test One', 'TC-DB-003 profile created by trigger');
select ok((select adult_confirmed_at is not null from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
          'TC-AUTH-017 adult confirmation recorded from signup metadata');

select * from finish();
rollback;
```
If inserting into `auth.users` fails on a NOT NULL column in your Supabase version, add that column in the test insert (check `\d auth.users`). If the installed CLI offers the community test helpers, they may replace this manual insert.

## 8. Task List (Part 1) — prompts for your AI assistant
Run in order; each ends with the report template from AGENTS.md §10. Do not skip tests.

### T1.0 Repository and tooling
> Read AGENTS.md, PHASE-1-SPEC.md and PHASE-1-BUILD-KIT.md. Create the project exactly as in Build Kit §3 (check each command against the installed CLI help first). Add `.env.example`, ESLint rules, Prettier, Husky, commitlint, lint-staged, and `docs/VERSIONS.md`. Add `.gitignore` entries for `.env*` (except `.env.example`) and local Supabase files. Add a minimal GitHub Actions workflow that runs `npm ci`, lint, typecheck and build with the dummy env values. Acceptance: `npm run lint`, `typecheck`, `build` pass; a commit with a fake key is blocked by the secret scan; commit messages follow Conventional Commits. Report any version differences from the Build Kit.

### T1.1 Design system foundation
> Implement Build Kit §5.7–5.9 and DESIGN SYSTEM §3–§9. Create tokens, fonts, theme provider (no flash), `cn` helper, and initialise shadcn/ui, then map its variables to our tokens. Build the shared components: Button variants (primary, highlight, secondary, ghost, danger; sizes 36/44/52), Input and Label with error text, Checkbox card, Toast, Tooltip, Mascot (SVG placeholder with states happy and oops), FreshnessChip (all four statuses), and a kitchen-sink page `/en/design` (noindex, dev-only) showing every component in light and dark. Acceptance: no hex codes in components; axe clean on the kitchen-sink page in both themes; contrast script (create `scripts/check-contrast.ts` reading the tokens) passes for every pair in DESIGN SYSTEM §3.4; focus ring visible; `prefers-reduced-motion` respected.

### T1.2 Internationalisation and routing
> Implement Build Kit §5.4–5.6 (i18n files, `proxy.ts`, next config). Create `messages/en.json` from PHASE-1-SPEC §6, the language switcher shell (English active; Bengali and Hindi disabled with "Coming soon"), `not-found` handling per the installed next-intl docs, and a lint rule or test that fails on hard-coded UI strings. Acceptance: `/` redirects to `/en`; unknown paths show the 404; `/admin` behaves exactly like any unknown path; the footer and header render from message keys; TC-I18N-001/002 pass.

### T1.3 Supabase foundation
> Initialise Supabase locally, apply Build Kit §7 migrations and seeds, generate types, and implement Build Kit §5.1–5.3, §5.9 and the claims helper. Configure Auth settings per §6. Write the pgTAP tests in §7.5 plus tests that every table has an allow and a deny case. Acceptance: `npm run db:reset`, `db:types`, `test:db` pass; anonymous callers cannot execute any function in `public` (TC-SEC-023); `/api/health` queries the database and returns 200; service-role/secret key never appears in the client bundle (add a build-output grep test).

### T1.4 Authentication
> Implement PHASE-1-SPEC US-P1-01…US-P1-06 using Server Actions or route handlers, Zod schemas shared by client and server, Turnstile on sign-up and (after repeated failures) login, rate limits from `RULES`, the auth callback with `safeNext`, the 60-second resend cooldown, "log out of all devices", password change with current-password check, email change with double confirmation, and the 18+ gate on `/en/welcome`. Configure the email templates from Spec §6.2 in the local config. Use `getClaims()` for pages and `requireFreshUser()` for password change and account deletion. Acceptance: every AC in US-P1-01…06 passes; Playwright tests TC-AUTH-001…018 pass against local Supabase and Mailpit (including session survival across a short token lifetime, TC-AUTH-018); axe clean; no account enumeration differences in responses.

## 9. Part 2 will contain
T1.5 Profile and settings · T1.6 Landing page and live background (tier detection, FPS watchdog, scene code) · T1.7 Help, FAQ accordion, Contact route (Turnstile, rate limit, inbox insert), Team page, footer, legal pages · T1.8 CSP nonce tightening · T1.9 Test suites (Vitest, Playwright, axe, Lighthouse CI) and the CI workflow · T1.10 Deploy to Vercel and Supabase staging/production, keep-alive workflow, launch checklist.