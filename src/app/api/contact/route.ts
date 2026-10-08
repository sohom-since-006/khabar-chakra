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
    const ticketId = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Store in Supabase contact_messages table
    try {
      const supabase = await createClient();
      await supabase.from('contact_messages').insert({
        name,
        email,
        topic,
        message: `[Subject: ${subject}]\n\n${message}`,
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
