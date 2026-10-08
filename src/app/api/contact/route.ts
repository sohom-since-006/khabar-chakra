import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { contactRateLimiter, checkRateLimit } from '@/lib/ratelimit';
import { verifyTurnstileToken } from '@/lib/turnstile';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name (2 to 80 characters).').max(80),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  topic: z.enum([
    'kitchen_intelligence',
    'inventory_tracking',
    'recipe_rescue',
    'technical_support',
    'privacy_request',
    'other',
  ]),
  subject: z.string().trim().min(3, 'Please add a short subject.').max(120),
  message: z.string().trim().min(10, 'Please write at least 10 characters (up to 2000).').max(2000),
  captchaToken: z.string().optional(),
});

// Simple in-memory fallback for offline test runners
const ipMap = new Map<string, number[]>();

function isMemoryRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipMap.get(ip) || [];
  const oneHourAgo = now - 60 * 60 * 1000;
  const recent = timestamps.filter(t => t > oneHourAgo);
  
  if (recent.length >= 5) {
    return true;
  }
  
  recent.push(now);
  ipMap.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // Check Upstash Redis rate limit first, fallback to memory
    const rateCheck = await checkRateLimit(contactRateLimiter, `contact:${ip}`);
    if (!rateCheck.success || isMemoryRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait a few minutes before submitting again.' },
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

    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input data.' },
        { status: 400 }
      );
    }

    const { name, email, topic, subject, message, captchaToken } = result.data;

    // Sanitize user inputs against XSS and control chars
    const { sanitizeUserInput } = await import('@/lib/sanitize');
    const cleanName = sanitizeUserInput(name, false);
    const cleanSubject = sanitizeUserInput(subject, false);
    const cleanMessage = sanitizeUserInput(message, false);

    // Check Cloudflare Turnstile token
    const captchaCheck = await verifyTurnstileToken(captchaToken, ip);
    if (!captchaCheck.success) {
      return NextResponse.json(
        { error: captchaCheck.error || 'Bot protection verification failed.' },
        { status: 403 }
      );
    }

    const ticketId = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Store in Supabase contact_messages table
    try {
      const supabase = await createClient();
      await supabase.from('contact_messages').insert({
        name: cleanName,
        email,
        topic,
        message: `[Subject: ${cleanSubject}]\n\n${cleanMessage}`,
        status: 'unread',
      });
    } catch (err) {
      console.warn('Database logging note:', err);
    }

    // 2. Dispatch via Resend
    const { sendContactDispatchEmail } = await import('@/lib/email/resend');
    const emailResult = await sendContactDispatchEmail({
      name,
      email,
      topic,
      subject,
      message,
      ticketId,
    });

    return NextResponse.json({
      success: true,
      ticketId,
      emailDispatched: emailResult.success,
      message: `Thanks! We've received your message (Ticket #${ticketId}).`,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
