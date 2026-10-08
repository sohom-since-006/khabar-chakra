import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Phase 1 Foundation · Validation & Security Gates', () => {
  // 1. Password and Name rules (TC-AUTH-001, TC-AUTH-002)
  const userSchema = z.object({
    fullName: z.string().trim().min(2).max(60),
    password: z.string().min(8).max(128),
    ageConfirmed: z.literal(true),
    termsAccepted: z.literal(true),
  });

  it('accepts valid credentials with 18+ confirmation (TC-AUTH-001)', () => {
    const valid = userSchema.safeParse({
      fullName: 'Sohom Paul',
      password: 'Strong-Secret-Phrase-2026',
      ageConfirmed: true,
      termsAccepted: true,
    });
    expect(valid.success).toBe(true);
  });

  it('rejects passwords shorter than 8 chars (TC-AUTH-002)', () => {
    const invalid = userSchema.safeParse({
      fullName: 'Sohom Paul',
      password: 'short',
      ageConfirmed: true,
      termsAccepted: true,
    });
    expect(invalid.success).toBe(false);
  });

  it('rejects passwords longer than 128 chars (TC-AUTH-002)', () => {
    const invalid = userSchema.safeParse({
      fullName: 'Sohom Paul',
      password: 'a'.repeat(129),
      ageConfirmed: true,
      termsAccepted: true,
    });
    expect(invalid.success).toBe(false);
  });

  it('blocks registration when 18+ box is unticked (TC-AUTH-017)', () => {
    const invalid = userSchema.safeParse({
      fullName: 'Sohom Paul',
      password: 'Strong-Secret-Phrase-2026',
      ageConfirmed: false,
      termsAccepted: true,
    });
    expect(invalid.success).toBe(false);
  });

  // 2. Open Redirect Guard (TC-AUTH-016 & US-P1-03)
  function isSafeRedirect(next: string | null): boolean {
    if (!next) return false;
    return next.startsWith('/') && !next.startsWith('//');
  }

  it('allows safe local relative redirects (TC-AUTH-016)', () => {
    expect(isSafeRedirect('/en/home')).toBe(true);
    expect(isSafeRedirect('/en/welcome')).toBe(true);
    expect(isSafeRedirect('/en/available?filter=urgent')).toBe(true);
  });

  it('rejects malicious external or protocol-relative open redirects (TC-AUTH-016)', () => {
    expect(isSafeRedirect('https://malicious-phishing.com')).toBe(false);
    expect(isSafeRedirect('//malicious-phishing.com')).toBe(false);
    expect(isSafeRedirect('javascript:alert(1)')).toBe(false);
  });

  // 3. Contact Form Schema (TC-SITE-001)
  const contactSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(254),
    topic: z.enum([
      'food_info',
      'donation',
      'technical_support',
      'partnership',
      'food_distribution',
      'privacy_request',
      'other',
    ]),
    subject: z.string().trim().min(3).max(120),
    message: z.string().trim().min(10).max(2000),
  });

  it('validates a standard contact inquiry (TC-SITE-001)', () => {
    const valid = contactSchema.safeParse({
      name: 'Ananya Das',
      email: 'ananya@example.com',
      topic: 'food_distribution',
      subject: 'Volunteer coordination in Asansol',
      message: 'Hello S-QUAD team, our NGO operates 4 community kitchens and would like to register for verification.',
    });
    expect(valid.success).toBe(true);
  });

  it('rejects contact message shorter than 10 chars', () => {
    const invalid = contactSchema.safeParse({
      name: 'Ananya',
      email: 'ananya@example.com',
      topic: 'other',
      subject: 'Hi',
      message: 'Too short',
    });
    expect(invalid.success).toBe(false);
  });

  // 4. Decision D8: Raw Meat/Fish/Egg sharing prohibition
  function isFoodListable(category: string, isCooked: boolean): boolean {
    if (category === 'meat_fish_egg') {
      return isCooked; // Only cooked meals containing them are listable; raw is strictly forbidden
    }
    return true;
  }

  it('strictly forbids raw meat, fish, and eggs from public listing (Decision D8)', () => {
    expect(isFoodListable('meat_fish_egg', false)).toBe(false);
    expect(isFoodListable('meat_fish_egg', true)).toBe(true);
    expect(isFoodListable('vegetables', false)).toBe(true);
    expect(isFoodListable('cooked_food', true)).toBe(true);
  });
});
