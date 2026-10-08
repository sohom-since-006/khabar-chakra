# Installed Framework & Library Versions

Created: 2026-10-08

| Package | Version | Notes |
|---------|---------|-------|
| `next` | 16.4.0 | Next.js 16 line. Request interception convention uses `proxy.ts` (Node runtime). |
| `react` | 19.3.0 | React 19 line. |
| `react-dom` | 19.3.0 | React DOM 19 line. |
| `tailwindcss` | ^4.0 | Tailwind CSS v4 using `@tailwindcss/turbopack`. |
| `typescript` | ^5.0 | TypeScript strict mode. |
| `@supabase/supabase-js` | ^2.49.1 | Supabase JavaScript client. |
| `@supabase/ssr` | ^0.6.1 | Supabase SSR package with cookie methods. |

## Notes on Next.js 16
- Request interception middleware uses `src/proxy.ts`.
- Server Components with runtime cookie access use dynamic rendering (`force-dynamic` or Suspense).
