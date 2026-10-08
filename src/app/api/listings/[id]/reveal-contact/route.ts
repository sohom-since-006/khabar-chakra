import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revealContactLimiter, checkRateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await context.params;

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // 1. Must be logged-in and authenticated (AGENTS.md Decision D2)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to view contact details.' },
        { status: 401 }
      );
    }

    // 2. Email verification check
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Please verify your email address to reveal contact details.' },
        { status: 403 }
      );
    }

    // 3. Upstash Redis rate limit per user ID (max 10 reveals per hour)
    const rateCheck = await checkRateLimit(
      revealContactLimiter,
      `user:${user.id}:reveal_contact`
    );
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error:
            'You have reached the contact reveal limit for this hour. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateCheck.limit.toString(),
            'X-RateLimit-Remaining': rateCheck.remaining.toString(),
            'X-RateLimit-Reset': rateCheck.reset.toString(),
          },
        }
      );
    }

    // 4. Call Postgres security-definer RPC using the user's session
    const { data, error } = await supabase.rpc('reveal_contact', {
      p_listing_id: listingId,
    });

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        {
          error:
            'Unable to reveal contact. The listing may have expired, reached its window, or require donor pre-approval.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contact: data[0],
    });
  } catch (error) {
    console.error('Contact reveal error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while retrieving contact details.' },
      { status: 500 }
    );
  }
}
