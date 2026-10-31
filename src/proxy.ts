import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const handleI18n = createIntlMiddleware({
  locales: ['en', 'bn', 'hi'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

// Domestic kitchen routes strictly private to the authenticated household
const isProtectedKitchenRoute = (path: string) => {
  return (
    path.startsWith('/home') ||
    path.startsWith('/inventory') ||
    path.startsWith('/recipes') ||
    path.startsWith('/planner') ||
    path.startsWith('/shopping-list') ||
    path.startsWith('/waste') ||
    path.startsWith('/nutrition') ||
    path.startsWith('/notifications') ||
    path.startsWith('/settings') ||
    path.startsWith('/profile')
  );
};

const isAuthRoute = (path: string) => {
  return path.startsWith('/login') || path.startsWith('/signup');
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Run next-intl middleware for locale routing
  const response = handleI18n(request);

  // If next-intl triggered a redirect (e.g. '/' -> '/en'), return early
  if (response.headers.get('location')) {
    return response;
  }

  // 2. Refresh Supabase session cookies & verify authenticated user
  let user = null;
  let sessionResponse: NextResponse | null = null;
  try {
    const res = await updateSession(request);
    sessionResponse = res.supabaseResponse;
    user = res.user;

    sessionResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
  } catch {
    // Graceful skip if Supabase credentials are empty or during cold builds
  }

  // 3. Extract locale & subpath for route-level access control
  const segments = pathname.split('/').filter(Boolean);
  const locale = ['en', 'bn', 'hi'].includes(segments[0]) ? segments[0] : 'en';
  const subPath = segments.length > 1 ? `/${segments.slice(1).join('/')}` : '/';

  // 4. Auth Gate: If unauthenticated, redirect to login with intended destination
  if (!user && isProtectedKitchenRoute(subPath)) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('next', pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    if (sessionResponse) {
      sessionResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
    }
    return redirectResponse;
  }

  // 5. If already authenticated and visiting login/signup, redirect straight to kitchen home
  if (user && isAuthRoute(subPath)) {
    const homeUrl = new URL(`/${locale}/home`, request.url);
    const redirectResponse = NextResponse.redirect(homeUrl);
    if (sessionResponse) {
      sessionResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
    }
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|branding|sw\\.js|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff2|js|css|map)$).*)",
  ],
};
