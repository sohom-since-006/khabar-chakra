import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
      return NextResponse.redirect(new URL(`/${locale}/home`, requestUrl.origin));
    }
  }

  // Return to login with error indicator if exchange fails
  return NextResponse.redirect(new URL(`/${locale}/login?error=auth_failed`, requestUrl.origin));
}
