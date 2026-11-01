import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createSafeUrl } from '@/utils/siteUrl';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  // Detect locale from cookie or default to 'en'
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  const locale = ['en', 'bn', 'hi'].includes(localeCookie || '') ? localeCookie : 'en';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next && next.startsWith('/') && !next.startsWith('//')) {
        return NextResponse.redirect(createSafeUrl(next, request));
      }
      return NextResponse.redirect(createSafeUrl(`/${locale}/home`, request));
    }
  }

  // Return to login with error indicator if exchange fails
  return NextResponse.redirect(createSafeUrl(`/${locale}/login?error=auth_failed`, request));
}
