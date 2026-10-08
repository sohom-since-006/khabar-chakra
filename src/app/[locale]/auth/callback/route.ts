import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Validate redirect destination: must start with single '/' and not '//' to prevent open redirect
      if (next && next.startsWith('/') && !next.startsWith('//')) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
      return NextResponse.redirect(new URL(`/${locale}`, requestUrl.origin));
    }
  }

  // Return to login with error indicator if exchange fails
  return NextResponse.redirect(new URL(`/${locale}/login?error=auth_failed`, requestUrl.origin));
}
