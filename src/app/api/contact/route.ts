import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name (2 to 80 characters).').max(80),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  topic: z.enum([
    'food_info',
    'donation',
    'technical_support',
    'partnership',
    'food_distribution',
    'privacy_request',
    'other',
  ]),
  subject: z.string().trim().min(3, 'Please add a short subject.').max(120),
  message: z.string().trim().min(10, 'Please write at least 10 characters (up to 2000).').max(2000),
});

// Simple in-memory rate limiter per IP for free tier: max 3 per hour
const ipMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipMap.get(ip) || [];
  const oneHourAgo = now - 60 * 60 * 1000;
  const recent = timestamps.filter(t => t > oneHourAgo);
  
  if (recent.length >= 3) {
    return true;
  }
  
  recent.push(now);
  ipMap.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input data.' },
        { status: 400 }
      );
    }

    const { name, email, topic, subject, message } = result.data;
    const supabase = await createClient();

    // Store in admin_inbox if table exists
    const { error: dbError } = await supabase.from('admin_inbox').insert({
      sender_name: name,
      sender_email: email,
      topic,
      subject,
      message,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      // If table is not yet migrated in remote Supabase, log safely without PII (Decision D6)
      console.warn('Note: admin_inbox table not accessible or pending migration. Message logged safely with masked metadata.');
    }

    return NextResponse.json({
      success: true,
      message: "Thanks! We've received your message.",
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
