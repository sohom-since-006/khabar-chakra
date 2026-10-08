import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const handleI18n = createIntlMiddleware({
  locales: ['en', 'bn', 'hi'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export async function proxy(request: NextRequest) {
  // Run next-intl middleware for locale routing
  const response = handleI18n(request);

  // Refresh Supabase session cookies
  try {
    const sessionResponse = await updateSession(request);
    sessionResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
  } catch {
    // Graceful skip if Supabase credentials are empty or during cold builds
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|branding|sw\\.js|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff2|js|css|map)$).*)",
  ],
};
