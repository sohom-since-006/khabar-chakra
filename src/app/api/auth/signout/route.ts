import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

async function handleSignOut(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  const locale = ['en', 'bn', 'hi'].includes(localeCookie || '') ? localeCookie : 'en';

  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    console.error('Signout route error:', err);
  }

  const response = NextResponse.redirect(new URL(`/${locale}/login?logout=true`, requestUrl.origin), {
    status: 303,
  });

  // Explicitly invalidate all Supabase auth cookies
  request.cookies.getAll().forEach((cookie) => {
    if (
      cookie.name.startsWith('sb-') ||
      cookie.name.includes('supabase') ||
      cookie.name.includes('auth-token')
    ) {
      response.cookies.delete(cookie.name);
      response.cookies.set(cookie.name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
      });
    }
  });

  return response;
}

export async function POST(request: NextRequest) {
  return handleSignOut(request);
}

export async function GET(request: NextRequest) {
  return handleSignOut(request);
}
